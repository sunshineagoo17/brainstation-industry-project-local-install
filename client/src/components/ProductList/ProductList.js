import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { saveAs } from "file-saver";
import { unparse } from "papaparse";
import boxIcon from "../../assets/icons/box-icon.svg";
import "./ProductList.scss";

const url = process.env.REACT_APP_BASE_URL;

const ProductList = ({ userId }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [products, setProducts] = useState([]);
  const [totalOffenders, setTotalOffenders] = useState(0);

  const generateShortUUID = useCallback(() => {
    let currentId = 1;
    return () => {
      const id = (currentId % 100).toString().padStart(2, "0");
      currentId++;
      return id;
    };
  }, []);

  const getStatus = (deviation) => {
    if (isNaN(deviation)) return "Undetermined";
    const absDeviation = Math.abs(deviation);
    if (absDeviation <= 5) return "Compliant";
    if (absDeviation <= 15) return "Attention";
    return "Non-Compliant";
  };

  const combineData = useCallback((dell, bestbuy, newegg) => {
    let offendersCount = 0;
    const generateId = generateShortUUID();
    const combined = dell.map((dellItem) => {
      const bestbuyItem = bestbuy.find(item => item.Dell_product === dellItem.Dell_product) || {};
      const neweggItem = newegg.find(item => item.Dell_product === dellItem.Dell_product) || {};

      const bestbuyPrice = parseFloat(bestbuyItem.Bestbuy_price);
      const neweggPrice = parseFloat(neweggItem.Newegg_price);
      const msrp = parseFloat(dellItem.Dell_price);

      const bestbuyDeviation = bestbuyPrice ? ((bestbuyPrice - msrp) / msrp) * 100 : NaN;
      const neweggDeviation = neweggPrice ? ((neweggPrice - msrp) / msrp) * 100 : NaN;

      if (!isNaN(bestbuyDeviation) && getStatus(bestbuyDeviation) !== "Compliant") offendersCount++;
      if (!isNaN(neweggDeviation) && getStatus(neweggDeviation) !== "Compliant") offendersCount++;

      return {
        id: generateId(),
        dellProductName: dellItem.Dell_product,
        msrp: dellItem.Dell_price ? `$${parseFloat(dellItem.Dell_price).toFixed(2)}` : "Not Available",
        bestbuyPrice: bestbuyItem.Bestbuy_price ? `$${parseFloat(bestbuyItem.Bestbuy_price).toFixed(2)}` : "Not Available",
        bestbuyDeviation: !isNaN(bestbuyDeviation) ? `${bestbuyDeviation.toFixed(2)}%` : "N/A",
        bestbuyCompliance: getStatus(bestbuyDeviation),
        neweggPrice: neweggItem.Newegg_price ? `$${parseFloat(neweggItem.Newegg_price).toFixed(2)}` : "Not Available",
        neweggDeviation: !isNaN(neweggDeviation) ? `${neweggDeviation.toFixed(2)}%` : "N/A",
        neweggCompliance: getStatus(neweggDeviation),
      };
    });

    setTotalOffenders(offendersCount);
    return combined.sort((a, b) => a.id - b.id);
  }, [generateShortUUID]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [dellResponse, bestbuyResponse, neweggResponse] = await Promise.all([
          axios.get(`${url}/api/data/dell`),
          axios.get(`${url}/api/data/compare/dell-bestbuy`),
          axios.get(`${url}/api/data/compare/dell-newegg`)
        ]);

        console.log("Dell response length:", dellResponse.data.length);
        console.log("BestBuy response length:", bestbuyResponse.data.length);
        console.log("Newegg response length:", neweggResponse.data.length);

        if (!Array.isArray(dellResponse.data) || !Array.isArray(bestbuyResponse.data) || !Array.isArray(neweggResponse.data)) {
          throw new Error("Expected JSON response to be an array");
        }

        const combinedData = combineData(
          dellResponse.data,
          bestbuyResponse.data,
          neweggResponse.data
        );
        setProducts(combinedData);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    fetchProducts();
  }, [combineData]);

  const handleExport = () => {
    if (products.length === 0) {
      console.warn("No products to export.");
      return;
    }

    const fields = [
      "id",
      "dellProductName",
      "msrp",
      "bestbuyPrice",
      "bestbuyDeviation",
      "bestbuyCompliance",
      "neweggPrice",
      "neweggDeviation",
      "neweggCompliance",
    ];

    const csvData = unparse({
      fields,
      data: products.map(product => ({
        id: product.id,
        dellProductName: product.dellProductName,
        msrp: product.msrp,
        bestbuyPrice: product.bestbuyPrice,
        bestbuyDeviation: product.bestbuyDeviation,
        bestbuyCompliance: product.bestbuyCompliance,
        neweggPrice: product.neweggPrice,
        neweggDeviation: product.neweggDeviation,
        neweggCompliance: product.neweggCompliance,
      })),
    });

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "dell_product_pricing_compliance_products_list_data_generated_by_spectra.csv");
  };

  const truncateText = (text, maxLength) => (text.length > maxLength ? `${text.substring(0, maxLength)}...` : text);

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
    setProducts((prevProducts) => {
      const sortedProducts = [...prevProducts];
      sortedProducts.sort((a, b) => {
        if (key === "dellProductName" || key === "bestbuyCompliance" || key === "neweggCompliance") {
          return direction === "ascending" ? a[key].localeCompare(b[key]) : b[key].localeCompare(a[key]);
        }
        const aValue = parseFloat(a[key].replace(/[^\d.-]/g, '')) || 0;
        const bValue = parseFloat(b[key].replace(/[^\d.-]/g, '')) || 0;
        return direction === "ascending" ? aValue - bValue : bValue - aValue;
      });
      return sortedProducts;
    });
  };

  return (
    <div className="product-list__wrapper">
      <div className="product-list__details">
        <div className="offenders-widget">
          <div className="offenders-widget__details">
            <h2 className="offenders-widget__details--heading">Total Deviated Products</h2>
            <span className="offenders-widget__details--count">{totalOffenders}</span>
          </div>
          <img className="offenders-widget__icon" src={boxIcon} alt="cube icon for the total offending products widget" />
        </div>
        <div className="product-list__heading">
          <div className="heading__content">
            <h1 className="heading__content--heading">Product Pricing Compliance</h1>
            <span className="heading__content--date">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
          <h2 className="product-list__heading--directions">
            Please review the <strong>compliance status</strong> and <strong>price deviations</strong> for each product below.
          </h2>
        </div>
      </div>
      <div className="product-list__table">
        <table className="product-table">
          <thead className="product-table__head">
            <tr className="product-table__column">
              <th className="product-table__column--item product-column__id" onClick={() => handleSort("id")}>ID</th>
              <th className="product-table__column--item product-column__name" onClick={() => handleSort("dellProductName")}>Dell Product Name</th>
              <th className="product-table__column--item product-column__msrp" onClick={() => handleSort("msrp")}>MSRP</th>
              <th className="product-table__column--item product-column__bbp" onClick={() => handleSort("bestbuyPrice")}>BestBuy Price</th>
              <th className="product-table__column--item product-column__bbd" onClick={() => handleSort("bestbuyDeviation")}>Deviation</th>
              <th className="product-table__column--item product-column__bbc" onClick={() => handleSort("bestbuyCompliance")}>Compliance</th>
              <th className="product-table__column--item product-column__nep" onClick={() => handleSort("neweggPrice")}>Newegg Price</th>
              <th className="product-table__column--item product-column__ned" onClick={() => handleSort("neweggDeviation")}>Deviation</th>
              <th className="product-table__column--item product-column__nec" onClick={() => handleSort("neweggCompliance")}>Compliance</th>
            </tr>
          </thead>
          <tbody className="product-table__body">
            {products.map((product) => (
              <tr className="product-table__row" key={product.id}>
                <td className="product-table__row--item row-id">{product.id}</td>
                <td className="product-table__row--item row-name" title={product.dellProductName}>{truncateText(product.dellProductName, 15)}</td>
                <td className="product-table__row--item row-msrp">{product.msrp ? product.msrp : "Not Available"}</td>
                <td className="product-table__row--item row-bbp">
                  <span className={`cell-content ${product.bestbuyPrice === "Not Available" ? "not-available" : ""}`}>{product.bestbuyPrice}</span>
                </td>
                <td className="product-table__row--item row-bbd">
                  <span className={`cell-content ${product.bestbuyDeviation === "N/A" ? "not-available" : ""}`}>{product.bestbuyDeviation}</span>
                </td>
                <td className="product-table__row--item row-bbc">
                  <span className={`cell-content ${product.bestbuyCompliance === "Compliant" ? "compliant" : ""} ${product.bestbuyCompliance === "Non-Compliant" ? "noncompliant" : ""} ${product.bestbuyCompliance === "Attention" ? "attention" : ""} ${product.bestbuyCompliance === "Undetermined" ? "not-available" : ""}`}>{product.bestbuyCompliance}</span>
                </td>
                <td className="product-table__row--item row-nep">
                  <span className={`cell-content ${product.neweggPrice === "Not Available" ? "not-available" : ""}`}>{product.neweggPrice}</span>
                </td>
                <td className="product-table__row--item row-ned">
                  <span className={`cell-content ${product.neweggDeviation === "N/A" ? "not-available" : ""}`}>{product.neweggDeviation}</span>
                </td>
                <td className="product-table__row--item row-nec">
                  <span className={`cell-content ${product.neweggCompliance === "Compliant" ? "compliant" : ""} ${product.neweggCompliance === "Non-Compliant" ? "noncompliant" : ""} ${product.neweggCompliance === "Attention" ? "attention" : ""} ${product.neweggCompliance === "Undetermined" ? "not-available" : ""}`}>{product.neweggCompliance}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="export-container">
        <button className="export-container__button" onClick={handleExport}>
          <span className="export-container__button--text">Export</span>
        </button>
      </div>
    </div>
  );
};

ProductList.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default ProductList;