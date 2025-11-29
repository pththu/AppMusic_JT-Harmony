import { Card, CardContent } from "@/components/ui";

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }: any) => (
  <Card className="flex-1 min-w-[200px] shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="">
      <div className="flex items-center justify-between pt-6">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-full ${colorClass}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default StatCard;