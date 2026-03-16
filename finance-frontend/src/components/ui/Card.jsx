const Card = ({ title, value }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">

      <p className="text-gray-500 text-sm">
        {title}
      </p>

      <h2 className="text-3xl font-bold mt-2">
        ₹{value}
      </h2>

    </div>
  );
};

export default Card;