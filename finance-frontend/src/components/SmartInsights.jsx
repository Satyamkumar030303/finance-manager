import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

function InsightItem({ icon: Icon, iconClass, text, highlight }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
      <div className={`p-1.5 rounded-lg flex-shrink-0 ${iconClass}`}>
        <Icon size={14} />
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
        {text}
        {highlight && (
          <span className="font-semibold text-gray-900 dark:text-gray-100 ml-1">
            {highlight}
          </span>
        )}
      </p>
    </div>
  );
}

export default function SmartInsights({ income, expense, savings, categories }) {
  const { t } = useTranslation();
  const savingRate = income > 0 ? ((savings / income) * 100).toFixed(1) : 0;
  const spendRatio = income > 0 ? ((expense / income) * 100).toFixed(1) : 0;

  let topCategory = "None";
  let max = 0;
  categories.forEach((c) => {
    if (c.amount > max) { max = c.amount; topCategory = c.category; }
  });

  const insights = [];

  if (income === 0) {
    insights.push({
      icon: AlertTriangle,
      iconClass: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
      text: t("insights.no_income"),
    });
  } else if (parseFloat(savingRate) >= 20) {
    insights.push({
      icon: CheckCircle,
      iconClass: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
      text: t("insights.great_savings"),
      highlight: `${savingRate}% ${t("insights.of_income")}`,
    });
  } else if (parseFloat(savingRate) < 10 && income > 0) {
    insights.push({
      icon: AlertTriangle,
      iconClass: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400",
      text: t("insights.low_savings"),
      highlight: `${savingRate}%. ${t("insights.low_savings_target")}`,
    });
  }

  if (topCategory !== "None") {
    insights.push({
      icon: TrendingUp,
      iconClass: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
      text: t("insights.top_category"),
      highlight: t(`categories.${topCategory.toLowerCase()}`, topCategory),
    });
  }

  if (parseFloat(spendRatio) > 90 && income > 0) {
    insights.push({
      icon: TrendingDown,
      iconClass: "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400",
      text: t("insights.high_spend"),
      highlight: `${spendRatio}% ${t("insights.high_spend_tail")}`,
    });
  }

  if (savings < 0) {
    insights.push({
      icon: AlertTriangle,
      iconClass: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400",
      text: t("insights.overspending"),
    });
  }

  if (insights.length === 0) {
    insights.push({
      icon: Lightbulb,
      iconClass: "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400",
      text: t("insights.add_more"),
    });
  }

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-purple-100 dark:bg-purple-900/40 rounded-lg text-purple-600 dark:text-purple-400">
          <Lightbulb size={16} />
        </div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t("insights.title")}</h3>
      </div>

      {/* Savings rate bar */}
      {income > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
            <span>{t("insights.savings_rate")}</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">{savingRate}%</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                parseFloat(savingRate) >= 20
                  ? "bg-emerald-500"
                  : parseFloat(savingRate) >= 10
                  ? "bg-amber-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${Math.min(Math.max(parseFloat(savingRate), 0), 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{t("insights.target")}</p>
        </div>
      )}

      <div className="space-y-2">
        {insights.map((ins, i) => (
          <InsightItem key={i} {...ins} />
        ))}
      </div>
    </div>
  );
}
