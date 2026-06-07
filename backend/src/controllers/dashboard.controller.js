const supabase = require('../config/supabase');

exports.getSupervisorMetrics = async (req, res) => {
  try {
    // 1. Métricas de Máquinas
    const { count: totalMachines } = await supabase
      .from('machines')
      .select('*', { count: 'exact', head: true });

    const { count: operativeMachines } = await supabase
      .from('machines')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'OPERATIVA');

    const { count: failureMachines } = await supabase
      .from('machines')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'FALLA');

    // 2. Mantenimientos Pendientes de Validación
    const { count: pendingValidationCount } = await supabase
      .from('maintenance_history')
      .select('*', { count: 'exact', head: true })
      .eq('is_validated', false);

    // 3. Alertas: Máquinas próximas a vencer (< 7 días)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekIso = nextWeek.toISOString().split('T')[0];
    
    const { data: machinesAlerts } = await supabase
      .from('machines')
      .select('id, name, next_maintenance')
      .not('next_maintenance', 'is', null)
      .lte('next_maintenance', nextWeekIso)
      .order('next_maintenance', { ascending: true });

    // 4. Alertas: OTs Críticas Pendientes
    const { data: criticalOrders } = await supabase
      .from('work_orders')
      .select('id, description, limit_date, machine:machines(name)')
      .eq('status', 'PENDIENTE')
      .eq('priority', 'CRITICA');

    // 5. Órdenes de trabajo resumen (traemos todo rápido para agrupar)
    const { data: workOrders } = await supabase
      .from('work_orders')
      .select('status');
    
    const workOrdersSummary = {
      PENDIENTE: 0,
      EN_PROGRESO: 0,
      COMPLETADA: 0
    };
    if (workOrders) {
      workOrders.forEach(wo => {
        if (workOrdersSummary[wo.status] !== undefined) {
          workOrdersSummary[wo.status]++;
        }
      });
    }

    // 6. Últimos 5 mantenimientos
    const { data: recentMaintenances } = await supabase
      .from('maintenance_history')
      .select('*, machine:machines(name), technician:users(name)')
      .order('created_at', { ascending: false })
      .limit(5);

    res.json({
      summary: {
        totalMachines: totalMachines || 0,
        operativeMachines: operativeMachines || 0,
        failureMachines: failureMachines || 0,
        pendingValidation: pendingValidationCount || 0
      },
      alerts: {
        overdueMachines: machinesAlerts || [],
        criticalOrders: criticalOrders || []
      },
      workOrders: workOrdersSummary,
      recentMaintenances: recentMaintenances || []
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPendingInterventions = async (req, res) => {
  try {
    // 1. Mantenimientos Pendientes de Validación
    const { data: pendingValidation } = await supabase
      .from('maintenance_history')
      .select('*, machine:machines(name), user:users(name)')
      .eq('is_validated', false)
      .order('date', { ascending: false });

    // 2. Máquinas Vencidas (sin importar el día exacto, solo < hoy)
    const todayIso = new Date().toISOString().split('T')[0];
    const { data: overdueMachines } = await supabase
      .from('machines')
      .select('id, name, sector, next_maintenance, risk')
      .not('next_maintenance', 'is', null)
      .lt('next_maintenance', todayIso);
      
    // Ordenar por riesgo (ALTO primero)
    const riskWeight = { 'ALTO': 3, 'MEDIO': 2, 'BAJO': 1 };
    const sortedOverdue = (overdueMachines || []).sort((a, b) => {
      return (riskWeight[b.risk] || 0) - (riskWeight[a.risk] || 0);
    });

    res.json({
      pendingValidation: pendingValidation || [],
      overdueMachines: sortedOverdue
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
