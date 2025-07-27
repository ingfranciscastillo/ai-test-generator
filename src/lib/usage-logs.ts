// Simulación de logs en memoria
// En producción, usar una base de datos real
interface UsageLog {
  id: string;
  userId: string;
  timestamp: Date;
  language: string;
  codeLength: number;
  success: boolean;
}

const usageLogs: UsageLog[] = [];

export async function logTestGeneration(
  userId: string,
  language: string,
  codeLength: number,
  success: boolean = true
) {
  const log: UsageLog = {
    id: generateId(),
    userId,
    timestamp: new Date(),
    language,
    codeLength,
    success,
  };

  usageLogs.push(log);

  // Mantener solo los últimos 1000 logs para evitar memory leaks
  if (usageLogs.length > 1000) {
    usageLogs.splice(0, usageLogs.length - 1000);
  }

  return log;
}

export async function getUserLogs(userId: string, limit: number = 50) {
  return usageLogs
    .filter((log) => log.userId === userId)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

export async function getUsageStats(userId: string) {
  const userLogs = usageLogs.filter((log) => log.userId === userId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const todayLogs = userLogs.filter((log) => log.timestamp >= today);
  const monthLogs = userLogs.filter((log) => log.timestamp >= thisMonth);

  const languageStats = userLogs.reduce((acc, log) => {
    acc[log.language] = (acc[log.language] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalGenerations: userLogs.length,
    todayGenerations: todayLogs.length,
    monthGenerations: monthLogs.length,
    languageStats,
    averageCodeLength:
      userLogs.length > 0
        ? Math.round(
            userLogs.reduce((sum, log) => sum + log.codeLength, 0) /
              userLogs.length
          )
        : 0,
    successRate:
      userLogs.length > 0
        ? Math.round(
            (userLogs.filter((log) => log.success).length / userLogs.length) *
              100
          )
        : 100,
  };
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
