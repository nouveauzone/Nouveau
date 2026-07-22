import { CATEGORIES } from "../data/constants";

export default function Sidebar({ activeCategory, setActiveCategory, priceMax, setPriceMax, className = "" }) {
  return (
    <aside className={`sf-sidebar sidebar ${className}`.trim()} aria-label="Product filters">
      <div>
        <p className="sf-sidebar-title">Categories</p>
        <ul>
          {CATEGORIES.map((category) => (
            <li key={category}>
              <button
                type="button"
                className={activeCategory === category ? "active" : ""}
                onClick={() => setActiveCategory(category)}>
                {category}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: "18px" }}>
        <p className="sf-sidebar-title">Max Price</p>
        <input
          type="range"
          min="1000"
          max="20000"
          step="500"
          value={priceMax}
          onChange={(e) => setPriceMax(parseInt(e.target.value, 10))}
          style={{ width: "100%" }} />
        <div className="sf-sidebar-meta">
          <span>Rs 1,000</span>
          <span>Rs {priceMax.toLocaleString("en-IN")}</span>
        </div>
      </div>
    </aside>
  );
}
