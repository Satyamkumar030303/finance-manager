import { useCurrency } from "../../context/CurrencyContext";

const Card = ({ title, value }) => {
  const { fmt } = useCurrency();
  return (
    <div className="card p-6 hover:shadow-md transition-shadow">
      <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
      <h2 className="text-3xl font-bold mt-2 text-gray-900 dark:text-gray-100">{fmt(value || 0)}</h2>
    </div>
  );
};

export default Card;
