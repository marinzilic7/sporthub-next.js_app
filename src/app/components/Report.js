"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function ReportComponent() {
  const [reportType, setReportType] = useState("salesByProduct");
  const [reportData, setReportData] = useState({
    salesByProduct: [],
    salesByCategory: [],
  });
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-12-31");

  const handleReportTypeChange = (event) => {
    setReportType(event.target.value);
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(
          `/api/report?type=${reportType}&startDate=${startDate}&endDate=${endDate}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch report");
        }
        const data = await response.json();
        setReportData(data);
      } catch (error) {
        console.error("Error fetching report:", error);
        setError("Failed to fetch report");
      }
    };

    fetchReport();
  }, [reportType, startDate, endDate]);

  return (
    <div class="accordion-item">
    <h2 class="accordion-header">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
        Izvještaji
      </button>
    </h2>
    <div id="collapseThree" class="accordion-collapse collapse" data-bs-parent="#accordionExample">
      <div class="accordion-body">
      <div>
      <div className="mt-3 ms-3">
        <label htmlFor="reportType">Izaberite izvještaj: </label>
        <select id="reportType" value={reportType} onChange={handleReportTypeChange}>
          <option value="salesByProduct">Izvještaj o prodaji po proizvodima</option>
          <option value="salesByCategory">Izvještaj o prodaji po kategorijama</option>
        </select>
      </div>

      <div className="mt-3 ms-3">
        <label htmlFor="startDate mt-3">Početni datum: </label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={handleStartDateChange}
        />
        <label htmlFor="endDate mt-3">Konačni datum: </label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={handleEndDateChange}
        />
      </div>

      {error ? <p className="text-danger">{error}</p> : (
        <div>
          {reportType === "salesByProduct" && (
            <div>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Proizvod ID</th>
                    <th>Proizvod Naziv</th>
                    <th>Ukupna Količina</th>
                    <th>Ukupni Prihod</th>
                    <th>Datum Narudžbe</th> {/* Add new column for date */}
                  </tr>
                </thead>
                <tbody>
                  {reportData.salesByProduct.length > 0 ? (
                    reportData.salesByProduct.map((item) => (
                      <tr key={item.itemId}>
                        <td>{item.itemId}</td>
                        <td>{item.itemName}</td>
                        <td>{item.totalQuantity}</td>
                        <td>{item.totalRevenue.toFixed(2)} €</td>
                        <td>{item.orderDate}</td> {/* Add date here */}
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5">No data available</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {reportType === "salesByCategory" && (
            <div>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Kategorija ID</th>
                    <th>Kategorija Naziv</th>
                    <th>Ukupna Količina</th>
                    <th>Ukupni Prihod</th>
                    <th>Datum Narudžbe</th> {/* Add new column for date */}
                  </tr>
                </thead>
                <tbody>
                  {reportData.salesByCategory.length > 0 ? (
                    reportData.salesByCategory.map((item) => (
                      <tr key={item.categoryId}>
                        <td>{item.categoryId}</td>
                        <td>{item.categoryName}</td>
                        <td>{item.totalQuantity}</td>
                        <td>{item.totalRevenue.toFixed(2)} €</td>
                        <td>{item.orderDate}</td> {/* Add date here */}
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5">Nema podataka</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
      </div>
    </div>
  </div>
    
  );
}
