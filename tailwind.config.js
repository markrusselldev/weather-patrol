// tailwind.config.js

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto", "Arial", "sans-serif"]
      },
      colors: {
        background: "var(--background-color)",
        text: "var(--text-color)",
        svg: "var(--svg-color)",
        navBg: "var(--nav-bg-color)",
        navHoverBg: "var(--nav-hover-bg-color)",
        navBorderColor: "var(--nav-border-color)",
        buttonBg: "var(--button-bg-color)",
        buttonHoverBg: "var(--button-hover-bg-color)",
        buttonActiveBg: "var(--button-active-bg-color)",
        buttonText: "var(--button-text-color)",
        buttonActiveText: "var(--button-active-text-color)",
        buttonBorderColor: "var(--button-border-color)",
        headerBg: "var(--header-bg-color)",
        headerText: "var(--header-text-color)",
        breadcrumbText: "var(--breadcrumb-text-color)",
        labelText: "var(--label-text-color)",
        dropdownBg: "var(--dropdown-bg-color)",
        dropdownText: "var(--dropdown-text-color)",
        dropdownBorderColor: "var(--dropdown-border-color)",
        dropdownHoverBg: "var(--dropdown-hover-bg-color)",
        dropdownActiveBg: "var(--dropdown-active-bg-color)",
        cardHeaderText: "var(--card-header-text-color)",
        cardBodyText: "var(--card-body-text-color)",
        cardBg: "var(--card-background-color)",
        cardBorderColor: "var(--card-border-color)",
        footerBg: "var(--footer-bg-color)",
        footerText: "var(--footer-text-color)",
        tableBorderColor: "var(--table-border-color)",
        tableThBg: "var(--table-th-bg-color)",
        tableThText: "var(--table-th-text-color)",
        tableTdText: "var(--table-td-text-color)",
        tableRowAltBg: "var(--table-row-alt-bg-color)",
        dataText: "var(--data-text-color)",
        hrColor: "var(--hr-color)",
        scrollbarBg: "var(--scrollbar-bg-color)",
        scrollbarThumb: "var(--scrollbar-thumb-color)",
        scrollbarThumbHover: "var(--scrollbar-thumb-hover-color)",
        chartLine: "var(--chart-line-color)",
        chartBg: "var(--chart-bg-color)",
        chartPointBg: "var(--chart-point-bg-color)",
        chartPointBorder: "var(--chart-point-border-color)",
        chartPointHoverBg: "var(--chart-point-hover-bg-color)",
        chartPointHoverBorder: "var(--chart-point-hover-border-color)",
        chartHoverBg: "var(--chart-hover-bg-color)",
        chartHoverBorder: "var(--chart-hover-border-color)"
      },
      gridTemplateColumns: {
        // Custom grid template columns for 15 columns
        15: "repeat(15, minmax(0, 1fr))"
      },
      height: {
        header: "4rem",
        nav: "3.5rem",
        button: "2.95rem",
        footer: "4rem"
      }
    }
  },
  plugins: []
};
