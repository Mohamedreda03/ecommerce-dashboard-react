import { useOrderStats } from "@/hooks/use-orders";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Loader2,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Activity,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import PermissionGuard from "@/components/shared/PermissionGuard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { data: stats, isLoading, isError } = useOrderStats();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="flex flex-col gap-4 p-8">
        <PageHeader title="Dashboard" description="Overview of your store" />
        <div className="text-destructive">Failed to load dashboard stats.</div>
      </div>
    );
  }

  const {
    totalOrders,
    totalRevenue,
    averageOrderValue,
    ordersByStatus,
    recentOrders,
  } = stats;

  const chartData = Object.entries(ordersByStatus).map(([status, count]) => ({
    name: status,
    count,
  }));

  return (
    <div className="flex flex-col gap-6 p-8">
      <PageHeader title="Dashboard" description="Overview of your store" />

      <PermissionGuard permission="read:analytics">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Orders
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {Number(totalRevenue).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Order Value
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {Number(averageOrderValue).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Delivered Orders
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ordersByStatus.DELIVERED || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {ordersByStatus.PENDING || 0} pending,{" "}
                {ordersByStatus.PROCESSING || 0} processing
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
          {/* Bar Chart */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Orders by Status</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill="currentColor"
                      radius={[4, 4, 0, 0]}
                      className="fill-primary"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                A list of your recent {recentOrders?.length || 0} orders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {recentOrders?.map((order) => (
                  <div key={order.id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {order.orderNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.user?.firstName} {order.user?.lastName} (
                        {order.user?.email})
                      </p>
                    </div>
                    <div className="ml-auto font-medium space-x-2 flex items-center">
                      <Badge variant="outline">{order.status}</Badge>
                      <span>${Number(order.totalAmount).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
                {(!recentOrders || recentOrders.length === 0) && (
                  <div className="text-center text-sm text-muted-foreground">
                    No recent orders
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </PermissionGuard>
    </div>
  );
}
