document
  .getElementById("keluhanForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const checkboxes = document.querySelectorAll(
      'input[name="keluhan"]:checked'
    );
    const keluhanList = Array.from(checkboxes).map(
      (checkbox) => checkbox.value
    );

    if (keluhanList.length === 0) {
      alert("Pilih minimal satu jenis layanan.");
      return;
    }

    const keluhan2 = {
      keluhan: keluhanList,
      timestamp: new Date().toISOString(),
    };

    let storedData = JSON.parse(localStorage.getItem("keluhan2")) || [];
    storedData.push(keluhan2);
    localStorage.setItem("keluhan2", JSON.stringify(storedData));
    alert("Data berhasil dikirim.");
    this.reset();
  });

function filterData() {
  const startDate = new Date(document.getElementById("startDate").value);
  const endDate = new Date(document.getElementById("endDate").value);
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;
  const rekapTable = document.getElementById("rekapTable");

  let storedData = JSON.parse(localStorage.getItem("keluhan2")) || [];
  const filteredData = storedData.filter((data) => {
    const dataDate = new Date(data.timestamp);
    const dataTime = dataDate.toTimeString().split(" ")[0].slice(0, 5);
    const isDateInRange = dataDate >= startDate && dataDate <= endDate;
    const isTimeInRange =
      (!startTime || dataTime >= startTime) &&
      (!endTime || dataTime <= endTime);

    return isDateInRange && isTimeInRange;
  });

  rekapTable.innerHTML = generateTable(filteredData);
  updateTotalSummary(filteredData);
  displayTotalRecords(filteredData);
}

function generateTable(data) {
  if (data.length === 0)
    return "<p>Tidak ada data dalam rentang waktu ini.</p>";

  let tableHTML =
    "<table><tr><th>Tanggal</th><th>Jam</th><th>Pelayanan</th></tr>";
  data.forEach((entry) => {
    entry.keluhan.forEach((keluhan) => {
      tableHTML += `<tr><td>${new Date(
        entry.timestamp
      ).toLocaleDateString()}</td><td>${new Date(
        entry.timestamp
      ).toLocaleTimeString()}</td><td>${keluhan}</td></tr>`;
    });
  });
  tableHTML += "</table>";
  return tableHTML;
}

function updateTotalSummary(data) {
  const summary = {};
  let totalEntries = 0;

  data.forEach((entry) => {
    entry.keluhan.forEach((keluhan) => {
      summary[keluhan] = (summary[keluhan] || 0) + 1;
      totalEntries++;
    });
  });

  const summaryDiv = document.getElementById("totalSummary");
  summaryDiv.innerHTML = "<h3>Rekap Pelayanan</h3>";
  for (const keluhan in summary) {
    summaryDiv.innerHTML += `<p>${keluhan}: ${summary[keluhan]}</p>`;
  }
  summaryDiv.innerHTML += `<h4>Total Semua Entri: ${totalEntries}</h4>`; // Menampilkan total jumlah semua entri
}

function displayTotalRecords(data) {
  const totalDiv = document.getElementById("totalRecords");
  const total = data.reduce((sum, entry) => sum + entry.keluhan.length, 0);
  totalDiv.innerHTML = `<h4>Total Keseluruhan Data: ${total}</h4>`;
}

function exportToExcel() {
  confirm("Export ke Excel?");

  // Ambil data dari localStorage
  const storedData = JSON.parse(localStorage.getItem("keluhan2")) || [];

  // Proses data untuk menghitung total per jenis pelayanan dan menghindari duplikasi
  const pelayananSummary = {};
  let totalEntries = 0;

  storedData.forEach((entry) => {
    entry.keluhan.forEach((keluhan) => {
      if (pelayananSummary[keluhan]) {
        pelayananSummary[keluhan]++;
      } else {
        pelayananSummary[keluhan] = 1;
      }
      totalEntries++;
    });
  });

  // Siapkan data untuk diekspor ke Excel
  const wsData = [
    ["Rekap Data Pelayanan"], // Judul
    ["Pelayanan", "Jumlah"], // Header
  ];

  // Tambahkan data pelayanan yang sudah dihitung
  for (const keluhan in pelayananSummary) {
    wsData.push([keluhan, pelayananSummary[keluhan]]);
  }

  // Tambahkan total jumlah semua entri
  wsData.push(["Total Pleyanan Hari Ini", totalEntries]);

  // Buat worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Tambahkan worksheet ke workbook
  XLSX.utils.book_append_sheet(wb, ws, "Rekap Data Pelayanan");

  // Ekspor ke file Excel
  XLSX.writeFile(wb, "rekap_data.xlsx");
}
