import { Card, CardContent, CardHeader, CardTitle } from "../ui";

const StatCard = ({ title, value, icon: Icon, iconClass }) => (
  <Card className="flex-1 min-w-[150px] shadow-sm hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      <Icon className={`h-4 w-4 ${iconClass}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default StatCard;