import { motion } from "framer-motion";
import { Users, BookOpen, TrendingUp, AlertTriangle, ArrowUpRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/AppLayout";
import { mockCourses } from "@/lib/mock-courses";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";

const kpis = [
  { label: "Total Inscritos", value: "123", icon: Users, change: "+12%", color: "text-primary" },
  { label: "Cursos Activos", value: "6", icon: BookOpen, change: "+2", color: "text-primary" },
  { label: "Tasa Ocupación", value: "72%", icon: TrendingUp, change: "+5%", color: "text-success" },
  { label: "Cupos Bajos", value: "3", icon: AlertTriangle, change: "", color: "text-warning" },
];

const chartData = mockCourses.map((c) => ({
  name: c.code,
  ocupacion: Math.round((c.enrolledCount / c.totalSlots) * 100),
  inscritos: c.enrolledCount,
  total: c.totalSlots,
}));

const barColors = chartData.map((d) =>
  d.ocupacion >= 90 ? "hsl(0, 72%, 55%)" : d.ocupacion >= 70 ? "hsl(40, 90%, 55%)" : "hsl(175, 70%, 50%)"
);

export default function Dashboard() {
  const lowCapacity = mockCourses.filter(
    (c) => c.status === "open" && (c.totalSlots - c.enrolledCount) <= 5
  );

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Resumen general de cursos electivos</p>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-surface p-5"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center`}>
                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  {kpi.change && (
                    <span className="flex items-center gap-0.5 text-xs text-primary font-medium">
                      <ArrowUpRight className="w-3 h-3" />
                      {kpi.change}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-display font-bold text-foreground mt-3">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-surface p-5"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <h2 className="font-display font-semibold text-foreground mb-4">Ocupación por Curso</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                  <XAxis dataKey="name" tick={{ fill: "hsl(215, 12%, 52%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(215, 12%, 52%)", fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(220, 18%, 12%)",
                      border: "1px solid hsl(220, 14%, 22%)",
                      borderRadius: "8px",
                      color: "hsl(210, 20%, 92%)",
                      fontSize: 12,
                    }}
                    formatter={(value: number, name: string) => [`${value}%`, "Ocupación"]}
                    labelFormatter={(label) => {
                      const c = mockCourses.find((x) => x.code === label);
                      return c ? c.name : label;
                    }}
                  />
                  <Bar dataKey="ocupacion" radius={[6, 6, 0, 0]} barSize={40}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={barColors[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Low capacity alerts */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-surface p-5"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Cursos con cupos bajos
            </h2>
            <div className="space-y-3">
              {lowCapacity.length === 0 ? (
                <p className="text-sm text-muted-foreground">Todos los cursos tienen cupos disponibles</p>
              ) : (
                lowCapacity.map((course) => {
                  const remaining = course.totalSlots - course.enrolledCount;
                  const pct = Math.round((course.enrolledCount / course.totalSlots) * 100);
                  return (
                    <div key={course.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{course.name}</p>
                          <Badge variant="secondary" className="text-[10px] bg-warning/10 text-warning border-warning/20">
                            {remaining} cupos
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{course.code} · {course.teacher}</p>
                      </div>
                      <div className="w-32 flex-shrink-0">
                        <Progress value={pct} className="h-2" />
                        <p className="text-[10px] text-muted-foreground mt-1 text-right">{pct}%</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* All courses quick list */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-surface p-5"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <h2 className="font-display font-semibold text-foreground mb-4">Todos los cursos</h2>
            <div className="space-y-2">
              {mockCourses.map((course) => {
                const pct = Math.round((course.enrolledCount / course.totalSlots) * 100);
                return (
                  <div key={course.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{course.name}</p>
                      <p className="text-xs text-muted-foreground">{course.code} · {course.schedule}</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${
                        course.status === "full"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {course.status === "full" ? "Lleno" : `${course.enrolledCount}/${course.totalSlots}`}
                    </Badge>
                    <div className="w-20 flex-shrink-0">
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
