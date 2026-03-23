"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  startOfMonth,
  startOfYear,
  subHours,
  subDays,
  eachHourOfInterval,
  eachDayOfInterval,
  eachMonthOfInterval,
  isSameHour,
  isSameDay,
  isSameMonth,
  format,
} from "date-fns";
import { es } from "date-fns/locale";

export type FlowPeriod = "day" | "week" | "month" | "year";

export interface FlowPoint {
  name: string;
  ingresos: number;
  gastos: number;
}

function parseLocalDate(d: string): Date {
  const parts = d.split("T")[0].split("-");
  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
}

export function buildChartData(
  period: FlowPeriod,
  expenses: any[],
  incomes: any[]
): FlowPoint[] {
  const now = new Date();

  // Helpers — work regardless of which date/amount columns the incomes table uses
  const incDate = (i: any) => i.fecha || i.created_at || i.date;
  const incAmount = (i: any) => Number(i.monto ?? i.amount ?? 0);

  if (period === "day") {
    const hours = eachHourOfInterval({ start: subHours(now, 23), end: now });
    return hours.map((hour) => {
      const inc = incomes
        .filter((i) => { const d = incDate(i); return d && isSameHour(new Date(d), hour); })
        .reduce((s, i) => s + incAmount(i), 0);
      const exp = expenses
        .filter((e) => { const d = e.created_at || e.fecha; return d && isSameHour(new Date(d), hour); })
        .reduce((s, e) => s + Number(e.monto || 0), 0);
      return { name: format(hour, "HH:mm"), ingresos: inc, gastos: exp };
    });
  }

  if (period === "week") {
    const days = eachDayOfInterval({ start: subDays(now, 6), end: now });
    return days.map((day) => {
      const inc = incomes
        .filter((i) => { const d = incDate(i); return d && isSameDay(parseLocalDate(String(d)), day); })
        .reduce((s, i) => s + incAmount(i), 0);
      const exp = expenses
        .filter((e) => { const d = e.fecha || e.created_at; return d && isSameDay(parseLocalDate(String(d)), day); })
        .reduce((s, e) => s + Number(e.monto || 0), 0);
      return { name: format(day, "EEE", { locale: es }), ingresos: inc, gastos: exp };
    });
  }

  if (period === "month") {
    const days = eachDayOfInterval({ start: startOfMonth(now), end: now });
    return days.map((day) => {
      const inc = incomes
        .filter((i) => { const d = incDate(i); return d && isSameDay(parseLocalDate(String(d)), day); })
        .reduce((s, i) => s + incAmount(i), 0);
      const exp = expenses
        .filter((e) => { const d = e.fecha || e.created_at; return d && isSameDay(parseLocalDate(String(d)), day); })
        .reduce((s, e) => s + Number(e.monto || 0), 0);
      return { name: format(day, "d"), ingresos: inc, gastos: exp };
    });
  }

  // year
  const months = eachMonthOfInterval({ start: startOfYear(now), end: now });
  return months.map((month) => {
    const inc = incomes
      .filter((i) => { const d = incDate(i); return d && isSameMonth(parseLocalDate(String(d)), month); })
      .reduce((s, i) => s + incAmount(i), 0);
    const exp = expenses
      .filter((e) => {
        const d = e.fecha || e.created_at;
        return d && isSameMonth(parseLocalDate(String(d)), month);
      })
      .reduce((s, e) => s + Number(e.monto || e.amount || 0), 0);
    return { name: format(month, "MMM", { locale: es }), ingresos: inc, gastos: exp };
  });
}

function getSinceISO(period: FlowPeriod): string {
  const now = new Date();
  let since: Date;
  if (period === "day") since = subHours(now, 23);
  else if (period === "week") since = subDays(now, 6);
  else if (period === "month") since = startOfMonth(now);
  else since = startOfYear(now);
  return since.toISOString().split("T")[0];
}

export function useFlowData(period: FlowPeriod) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Ref so realtime callback always calls the latest fetchData (no stale closure)
  const fetchRef = useRef<() => Promise<void>>(async () => {});

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const since = getSinceISO(period);

    const [
      { data: expData, error: expError },
      { data: incData, error: incError },
    ] = await Promise.all([
      supabase
        .from("expenses")
        .select("fecha, monto, created_at")
        .eq("user_id", user.id)
        .gte("fecha", since),
      supabase
        .from("incomes")
        .select("*")
        .eq("user_id", user.id),
    ]);

    if (expError) console.error("[FlowChart] expenses error:", expError.message);
    if (incError) console.error("[FlowChart] incomes error:", incError.message);

    setExpenses(expData || []);
    setIncomes(incData || []);
    setLoading(false);
  }, [period]);

  // Keep ref in sync with latest fetchData
  useEffect(() => {
    fetchRef.current = fetchData;
  });

  // Fetch on mount and when period changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime: refetch when any expense or income is inserted/updated/deleted
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`flow-${period}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => fetchRef.current())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incomes' }, () => fetchRef.current())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [period]);

  const chartData = useMemo(
    () => buildChartData(period, expenses, incomes),
    [period, expenses, incomes]
  );

  const hasData = chartData.some((d) => d.ingresos > 0 || d.gastos > 0);

  return { chartData, hasData, loading, refetch: fetchData };
}
