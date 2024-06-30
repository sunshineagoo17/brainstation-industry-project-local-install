import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import shoppingCartIcon from "../../assets/icons/shopping-cart.svg";
import boxFullIcon from "../../assets/icons/box-full-icon.svg";
import chartIcon from "../../assets/icons/data-analysis-icon.svg";
import checkmarkIcon from "../../assets/icons/compliance-rate-icon.svg";
import notifyIcon from "../../assets/icons/notify-icon.svg";
import "./RetailerList.scss";

// Base Url
const url = process.env.REACT_APP_BASE_URL;

const RetailerList = ({ userId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("UserId in RetailerPage:", userId); // Log userId for debugging

    const fetchData = async () => {
      try {
        const response = await axios.get(`${url}/api/retailers`);
        console.log("Fetched data:", response.data); // Log fetched data for debugging
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Attempt to fetch the most recent data
        const recentResponse = await axios.get(`${url}/api/retailers/recent`);
        if (recentResponse.data) {
          console.log("Fetched most recent available data:", recentResponse.data);
          setData(recentResponse.data);
          console.log("Current CSV is missing. Using the most recent data available. Please scrape for the most recent data.");
        } else {
          console.error("No recent data available. Please perform a manual scrape.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Function to get the status based on deviation
  const getStatus = (deviation) => {
    if (Math.abs(deviation) <= 5) {
      return "Compliant";
    } else if (Math.abs(deviation) > 5 && Math.abs(deviation) <= 15) {
      return "Needs Attention";
    } else if (Math.abs(deviation) > 15) {
      return "Non-Compliant";
    }
    return "Undetermined";
  };

  // Function to calculate compliance rate and average deviation
  const calculateMetrics = (products) => {
    console.log("Calculating metrics for products:", products); // Log products for debugging
    if (!products || products.length === 0) {
      return {
        complianceRate: 0,
        averageDeviation: 0,
        totalDeviatedProducts: 0,
      };
    }

    const totalProducts = products.length;
    const compliantProducts = products.filter(
      (product) => getStatus(parseFloat(product.Deviation)) === "Compliant"
    ).length;
    const complianceRate = (compliantProducts / totalProducts) * 100;
    const averageDeviation =
      products.reduce(
        (sum, product) => sum + Math.abs(parseFloat(product.Deviation) || 0),
        0
      ) / totalProducts;

    console.log("Total Products: ", totalProducts); // Log total products count
    console.log("Compliant Products: ", compliantProducts); // Log compliant products count
    console.log("Compliance Rate: ", complianceRate); // Log compliance rate
    console.log("Average Deviation: ", averageDeviation); // Log average deviation

    return {
      complianceRate: complianceRate.toFixed(2),
      averageDeviation: averageDeviation.toFixed(2),
      totalDeviatedProducts: totalProducts - compliantProducts,
    };
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    console.log("Data is not available yet."); // Log if data is not available
    return null;
  }

  const renderTable = (products, retailer) => {
    // Filter out non-compliant products and sort them based on deviation (absolute value)
    const nonCompliantProducts = products.filter(
      (product) => getStatus(parseFloat(product.Deviation)) === "Non-Compliant"
    );
    const topNonCompliantProducts = nonCompliantProducts
      .sort((a, b) => Math.abs(b.Deviation) - Math.abs(a.Deviation))
      .slice(0, 5); // Get top 5 non-compliant products

    const truncateText = (text, maxLength) => {
      if (text.length > maxLength) {
        return text.substring(0, maxLength) + "...";
      }
      return text;
    };

    return (
      <table className="retailer-table">
        <thead className="retailer-table__head">
          <tr className="retailer-table__column">
            <th className="retailer-table__column--item retailer-column__id">
              ID
            </th>
            <th className="retailer-table__column--item retailer-column__dell-product">
              Dell Product Name
            </th>
            <th className="retailer-table__column--item retailer-column__msrp">
              MSRP
            </th>
            <th
              className={`retailer-table__column--item retailer-column__retailer-price ${
                retailer === "Bestbuy" ? "bestbuy-header" : ""
              } ${retailer === "Newegg" ? "newegg-header" : ""}`}
            >{`${retailer} Price`}</th>
            <th
              className={`retailer-table__column--item retailer-column__deviation ${
                retailer === "Bestbuy" ? "bestbuy-header" : ""
              } ${retailer === "Newegg" ? "newegg-header" : ""}`}
            >
              Deviation
            </th>
            <th
              className={`retailer-table__column--item retailer-column__compliance ${
                retailer === "Bestbuy" ? "bestbuy-header" : ""
              } ${retailer === "Newegg" ? "newegg-header" : ""}`}
            >
              Compliance
            </th>
          </tr>
        </thead>
        <tbody className="retailer-table__body">
          {topNonCompliantProducts.map((product, index) => (
            <tr className="retailer-table__row" key={`${retailer}-${index}`}>
              <td className="retailer-table__row--item rrow-id">{index + 1}</td>
              <td className="retailer-table__row--item rrow-dell-product">
                {truncateText(product.Dell_product, 15)}
              </td>
              <td className="retailer-table__row--item rrow-msrp">
                ${parseFloat(product.Dell_price).toFixed(2)}
              </td>
              <td className="retailer-table__row--item rrow-retailer-price">
                ${parseFloat(product[`${retailer}_price`]).toFixed(2)}
              </td>
              <td className="retailer-table__row--item rrow-deviation">
                {parseFloat(product.Deviation).toFixed(2)}%
              </td>
              <td className="retailer-table__row--item rrow-compliance">
                <span
                  className={`cell-content ${
                    getStatus(parseFloat(product.Deviation)) === "Compliant"
                      ? "compliant"
                      : ""
                  } ${
                    getStatus(parseFloat(product.Deviation)) === "Non-Compliant"
                      ? "non-compliant"
                      : ""
                  } ${
                    getStatus(parseFloat(product.Deviation)) === "Needs Attention"
                      ? "attention"
                      : ""
                  } ${
                    getStatus(parseFloat(product.Deviation)) === "Undetermined"
                      ? "not-available"
                      : ""
                  }`}
                >
                  {getStatus(parseFloat(product.Deviation))}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const bestbuyMetrics = calculateMetrics(data.bestbuy.allProducts);
  const neweggMetrics = calculateMetrics(data.newegg.allProducts);

  console.log("BestBuy Metrics:", bestbuyMetrics); // Log BestBuy metrics
  console.log("Newegg Metrics:", neweggMetrics); // Log Newegg metrics

  const handleNotifyBBClick = () => {
    window.location.href = encodeURI(
      "mailto:jessicaherzog@bestbuy.ca?subject=MSRP Compliance Report for BestBuy&body=Dear BestBuy Team,\n\n" +
        "We hope this message finds you well.\n\n" +
        "We have conducted a recent review and identified some pricing discrepancies for Dell products on your platform that do not align with our MSRP. To help you address these issues, we have attached a detailed report outlining the specific products and their current pricing. We kindly request you to review this report and make the necessary adjustments to ensure compliance with our MSRP guidelines.\n\n" +
        "Thank you for your prompt attention to this matter. We value our partnership and appreciate your cooperation.\n\n" +
        "Best regards,\n\n" +
        "Ali Hayder\n" +
        "Lead Data Scientist\n" +
        "(Merchandising/Growth/Pricing)\n" +
        "Sent through Spectra | Dell Technologies\n"
    );
  };

  const handleNotifyNeweggClick = () => {
    window.location.href = encodeURI(
      "mailto:ronaldchan@newegg.ca?subject=MSRP Compliance Report for Newegg&body=Dear Newegg Team,\n\n" +
        "We hope this message finds you well.\n\n" +
        "We have conducted a recent review and identified some pricing discrepancies for Dell products on your platform that do not align with our MSRP. To help you address these issues, we have attached a detailed report outlining the specific products and their current pricing. We kindly request you to review this report and make the necessary adjustments to ensure compliance with our MSRP guidelines.\n\n" +
        "Thank you for your prompt attention to this matter. We value our partnership and appreciate your cooperation.\n\n" +
        "Best regards,\n\n" +
        "Ali Hayder\n" +
        "Lead Data Scientist\n" +
        "(Merchandising/Growth/Pricing)\n" +
        "Sent through Spectra | Dell Technologies\n"
    );
  };

  return (
    <div className="retailer__wrapper">
      <div className="retailer__details">
        <div className="retailer-widget">
          <div className="retailer-widget__container">
            <div className="retailer-widget__details">
              <h2 className="retailer-widget__details--heading">
                Total Offenders
              </h2>
              <span className="retailer-widget__details--count">2</span>
            </div>
            <div className="retailer-widget__icon-container">
              <img
                className="retailer-widget__cart-icon"
                src={shoppingCartIcon}
                alt="shopping cart icon for the total offenders widget"
              />
            </div>
          </div>

          <div className="retailer-widget__heading">
            <div className="retailer-heading__content">
              <h1 className="retailer-heading__content--heading">
                Retailer Pricing Compliance
              </h1>
              <span className="retailer-heading__content--date">
                {currentDate}
              </span>
            </div>
            <h2 className="retailer-widget__heading--directions">
              Please review the <strong>compliance</strong> and{" "}
              <strong>deviation</strong> values for products sold by these{" "}
              <strong>retailers</strong>.
            </h2>
          </div>
        </div>

        <div className="retailer__main-content">
          <div className="retailer__bestbuy-container">
            <div className="retailer-container__retailer-label--bb">
              BestBuy
            </div>
            <div className="table-container__retails">
              <div className="retailer-container">
                <div className="retailer-section">
                  <div className="retailer-content">
                    {renderTable(data.bestbuy.allProducts, "Bestbuy")}
                  </div>
                </div>
                <div className="retailer__tiles">
                  <div className="tiles__container--one">
                    <div className="retailer__deviated-products">
                      <div className="retailer__deviated-products--container">
                        <h2 className="retailer__deviated-products--heading">
                          Total Deviated Products
                        </h2>
                        <span className="retailer__deviated-products--count">
                          {bestbuyMetrics.totalDeviatedProducts}
                        </span>
                      </div>
                      <div className="retailer__deviated-products--img">
                        <img
                          className="retailer__deviated-products--icon"
                          src={boxFullIcon}
                          alt="product box icon"
                        />
                      </div>
                    </div>
                    <div className="retailer__average-deviation">
                      <div className="retailer__average-deviation--container">
                        <h2 className="retailer__average-deviation--heading">
                          Total Average Deviation
                        </h2>
                        <span className="retailer__average-deviation--count">
                          {bestbuyMetrics.averageDeviation}%
                        </span>
                      </div>
                      <div className="retailer__average-deviation--img">
                        <img
                          className="retailer__average-deviation--icon"
                          src={chartIcon}
                          alt="chart icon"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="tiles__container--two">
                    <div className="retailer__compliance-rate">
                      <div className="retailer__compliance-rate--container">
                        <h2 className="retailer__compliance-rate--heading">
                          Total Compliance Rate
                        </h2>
                        <span className="retailer__compliance-rate--count">
                          {bestbuyMetrics.complianceRate}%
                        </span>
                      </div>
                      <div className="retailer__compliance-rate--img">
                        <img
                          className="retailer__compliance-rate--icon"
                          src={checkmarkIcon}
                          alt="checkmark icon"
                        />
                      </div>
                    </div>
                    <div
                      className="retailer__notify"
                      onClick={handleNotifyBBClick}
                    >
                      <div className="retailer__notify--container">
                        <h2 className="retailer__notify--heading">
                          Send Report to BestBuy
                        </h2>
                        <span className="retailer__notify--copy">
                          Notify Retailer
                        </span>
                      </div>
                      <div className="retailer__notify--img">
                        <img
                          className="retailer__notify--icon"
                          src={notifyIcon}
                          alt="notify icon"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="retailer__newegg-container">
            <div className="retailer-container__retailer-label--newegg">
              Newegg
            </div>
            <div className="table-container">
              <div className="retailer-container">
                <div className="retailer-section">
                  <div className="retailer-content">
                    {renderTable(data.newegg.allProducts, "Newegg")}
                  </div>
                </div>
                <div className="retailer__tiles">
                  <div className="newegg-tiles__container">
                    <div className="retailer__deviated-products">
                      <div className="retailer__deviated-products--container">
                        <h2 className="retailer__deviated-products--heading">
                          Total Deviated Products
                        </h2>
                        <span className="retailer__deviated-products--count">
                          {neweggMetrics.totalDeviatedProducts}
                        </span>
                      </div>
                      <div className="retailer__deviated-products--img">
                        <img
                          className="retailer__deviated-products--icon"
                          src={boxFullIcon}
                          alt="product box icon"
                        />
                      </div>
                    </div>
                    <div className="retailer__average-deviation">
                      <div className="retailer__average-deviation--container">
                        <h2 className="retailer__average-deviation--heading">
                          Total Average Deviation
                        </h2>
                        <span className="retailer__average-deviation--count">
                          {neweggMetrics.averageDeviation}%
                        </span>
                      </div>
                      <div className="retailer__average-deviation--img">
                        <img
                          className="retailer__average-deviation--icon"
                          src={chartIcon}
                          alt="chart icon"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="newegg-tiles__container">
                    <div className="retailer__compliance-rate">
                      <div className="retailer__compliance-rate--container">
                        <h2 className="retailer__compliance-rate--heading">
                          Total Compliance Rate
                        </h2>
                        <span className="retailer__compliance-rate--count">
                          {neweggMetrics.complianceRate}%
                        </span>
                      </div>
                      <div className="retailer__compliance-rate--img">
                        <img
                          className="retailer__compliance-rate--icon"
                          src={checkmarkIcon}
                          alt="checkmark icon"
                        />
                      </div>
                    </div>
                    <div
                      className="retailer__notify"
                      onClick={handleNotifyNeweggClick}
                    >
                      <div className="retailer__notify--container">
                        <h2 className="retailer__notify--heading">
                          Send Report to Newegg
                        </h2>
                        <span className="retailer__notify--copy">
                          Notify Retailer
                        </span>
                      </div>
                      <div className="retailer__notify--img">
                        <img
                          className="retailer__notify--icon"
                          src={notifyIcon}
                          alt="notify icon"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

RetailerList.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default RetailerList;