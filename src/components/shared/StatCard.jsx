import { Card } from "@/components/ui/card";

export default function StatCard({ label, value, icon: Icon, trend, accent = false }) {
  return (
    <Card className={`relative overflow-hidden p-5 ${accent ? "bg-primary text-primary-foreground" : ""}`}>
      <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full ${accent ? "bg-accent/10" : "bg-accent/5"}`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-medium uppercase tracking-wider ${accent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
            {label}
          </span>
          {Icon && (
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent ? "bg-accent/20" : "bg-muted"}`}>
              <Icon className={`w-4 h-4 ${accent ? "text-accent" : "text-muted-foreground"}`} />
            </div>
          )}
        </div>
        <p className={`text-2xl sm:text-3xl font-heading font-bold ${accent ? "text-primary-foreground" : "text-foreground"}`}>
          {value}
        </p>
        {trend && (
          <p className={`text-xs mt-1 ${accent ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
            {trend}
          </p>
        )}
      </div>
    </Card>
  );
}