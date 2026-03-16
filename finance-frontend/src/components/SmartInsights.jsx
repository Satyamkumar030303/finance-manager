const SmartInsights = ({ income, expense, savings, categories }) => {

  const savingRate =
    income > 0 ? ((savings / income) * 100).toFixed(1) : 0;

  let topCategory = "None";
  let max = 0;

  categories.forEach(c => {
    if (c.amount > max) {
      max = c.amount;
      topCategory = c.category;
    }
  });

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 border">

      <h3 className="text-lg font-semibold mb-4">
        Smart Insights
      </h3>

      <ul className="space-y-2 text-gray-700">

        <li>
          💡 Biggest expense category:
          <span className="font-semibold ml-1">
            {topCategory}
          </span>
        </li>

        <li>
          💰 Saving rate:
          <span className="font-semibold ml-1">
            {savingRate}%
          </span>
        </li>

        <li>
          📊 Total expense:
          <span className="font-semibold ml-1">
            ₹{expense}
          </span>
        </li>

      </ul>

    </div>
  );
};

export default SmartInsights;