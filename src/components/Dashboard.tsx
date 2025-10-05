import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Calendar as CalendarIcon,
  Star,
  BarChart,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { Tarea, TareasPorDia, Miembro, EstadisticasMiembro } from '@/types';
import { MESES } from '@/lib/calendar-utils';
import {
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface DashboardProps {
  tareas: TareasPorDia;
  currentMonth: number;
  currentYear: number;
  onSectionChange: (section: string) => void;
}

const Dashboard = ({ tareas, currentMonth, currentYear, onSectionChange }: DashboardProps) => {
  const { estadisticas, chartData, categoryData } = useMemo(() => {
    const todasLasTareas: Tarea[] = Object.values(tareas).flat();
    const completadas = todasLasTareas.filter(t => t.completada);
    const pendientes = todasLasTareas.filter(t => !t.completada);

    const estadisticasPorMiembro: Record<Miembro, EstadisticasMiembro> = {
      mama: { total: 0, completadas: 0, pendientes: 0, porcentaje: 0 },
      papa: { total: 0, completadas: 0, pendientes: 0, porcentaje: 0 },
      ambos: { total: 0, completadas: 0, pendientes: 0, porcentaje: 0 },
    };

    const tareasPorCategoria: { [key: string]: number } = {};

    todasLasTareas.forEach(tarea => {
      // Stats por miembro
      estadisticasPorMiembro[tarea.miembro].total++;
      if (tarea.completada) {
        estadisticasPorMiembro[tarea.miembro].completadas++;
      } else {
        estadisticasPorMiembro[tarea.miembro].pendientes++;
      }
      
      // Stats por categoría
      const categoria = tarea.categoria || 'Sin Categoría';
      if (tareasPorCategoria[categoria]) {
        tareasPorCategoria[categoria]++;
      } else {
        tareasPorCategoria[categoria] = 1;
      }
    });

    Object.keys(estadisticasPorMiembro).forEach(miembro => {
      const stats = estadisticasPorMiembro[miembro as Miembro];
      stats.porcentaje = stats.total > 0 ? Math.round((stats.completadas / stats.total) * 100) : 0;
    });

    const chartData = [
      { name: 'Mamá', completadas: estadisticasPorMiembro.mama.completadas, pendientes: estadisticasPorMiembro.mama.pendientes },
      { name: 'Papá', completadas: estadisticasPorMiembro.papa.completadas, pendientes: estadisticasPorMiembro.papa.pendientes },
      { name: 'Ambos', completadas: estadisticasPorMiembro.ambos.completadas, pendientes: estadisticasPorMiembro.ambos.pendientes },
    ];
    
    const categoryData = Object.entries(tareasPorCategoria).map(([name, value]) => ({ name, value }));
    
    const estadisticas = {
      total: todasLasTareas.length,
      completadas: completadas.length,
      pendientes: pendientes.length,
      porcentajeCompletado: todasLasTareas.length > 0 ? Math.round((completadas.length / todasLasTareas.length) * 100) : 0,
      estadisticasPorMiembro,
      tareasRecientes: completadas.slice(-5).reverse(),
      tareasPendientesUrgentes: pendientes.slice(0, 5)
    };
    
    return { estadisticas, chartData, categoryData };
  }, [tareas]);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f'];

  const getMiembroIcon = (miembro: Miembro) => {
    switch (miembro) {
      case 'mama': return '👩';
      case 'papa': return '👨';
      case 'ambos': return '👨‍👩';
    }
  };

  const getMiembroColor = (miembro: Miembro) => {
    switch (miembro) {
      case 'mama': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'papa': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'ambos': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">{MESES[currentMonth]} {currentYear}</p>
        </div>
        <Button onClick={() => onSectionChange('calendar')} className="gap-2">
          <CalendarIcon className="w-4 h-4" />
          Ver Calendario
        </Button>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completadas</p>
                <p className="text-2xl font-bold">{estadisticas.completadas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold">{estadisticas.pendientes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Progreso</p>
                <p className="text-2xl font-bold">{estadisticas.porcentajeCompletado}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{estadisticas.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progreso General */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso del Mes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Tareas completadas</span>
              <span>{estadisticas.completadas} de {estadisticas.total}</span>
            </div>
            <Progress value={estadisticas.porcentajeCompletado} className="h-3" />
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estadísticas por Miembro con Gráfico */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart className="w-5 h-5" />
                    Reparto de Tareas
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{}} className="min-h-[250px] w-full">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar dataKey="completadas" fill="#82ca9d" name="Completadas" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="pendientes" fill="#ffc658" name="Pendientes" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>

        {/* Tareas por Categoría */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5" />
                    Tareas por Categoría
                </CardTitle>
            </CardHeader>
            <CardContent>
                {categoryData.length > 0 ? (
                    <ChartContainer config={{}} className="min-h-[250px] w-full">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<ChartTooltipContent nameKey="name" />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                ) : (
                    <p className="text-muted-foreground text-center py-4">
                        No hay datos de categorías para mostrar.
                    </p>
                )}
            </CardContent>
        </Card>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tareas Pendientes Urgentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Tareas Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {estadisticas.tareasPendientesUrgentes.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  ¡Genial! No hay tareas pendientes
                </p>
              ) : (
                estadisticas.tareasPendientesUrgentes.map((tarea) => (
                  <div key={tarea.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{tarea.texto}</p>
                      {tarea.notas && (
                        <p className="text-sm text-muted-foreground">{tarea.notas}</p>
                      )}
                    </div>
                    <Badge variant="outline" className={getMiembroColor(tarea.miembro)}>
                      {getMiembroIcon(tarea.miembro)} {tarea.miembro}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tareas Completadas Recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Completadas Recientemente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {estadisticas.tareasRecientes.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Aún no hay tareas completadas
                </p>
              ) : (
                estadisticas.tareasRecientes.map((tarea) => (
                  <div key={tarea.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-950">
                    <div className="flex-1">
                      <p className="font-medium">{tarea.texto}</p>
                      {tarea.valoracion && (
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: tarea.valoracion }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className={getMiembroColor(tarea.miembro)}>
                      {getMiembroIcon(tarea.miembro)} {tarea.miembro}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
