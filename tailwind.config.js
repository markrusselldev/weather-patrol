export default {
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
        buttonBg: "var(--button-bg-color)",
        buttonHoverBg: "var(--button-hover-bg-color)",
        buttonActiveBg: "var(--button-active-bg-color)",
        buttonText: "var(--button-text-color)",
        buttonBorder: "var(--button-border)",
        headerBg: "var(--header-bg-color)",
        headerText: "var(--header-text-color)",
        breadcrumbText: "var(--breadcrumb-text-color)",
        labelText: "var(--label-text-color)",
        dropdownBg: "var(--dropdown-bg-color)",
        dropdownText: "var(--dropdown-text-color)",
        dropdownBorder: "var(--dropdown-border-color)",
        dropdownHoverBg: "var(--dropdown-hover-bg-color)",
        dropdownActiveBg: "var(--dropdown-active-bg-color)",
        gridItemHeader: "var(--grid-item-header-color)",
        gridItemBg: "var(--grid-item-bg-color)",
        footerBg: "var(--footer-bg-color)",
        footerText: "var(--footer-text-color)",
        placeholderBg: "var(--placeholder-bg-color)",
        placeholderBorder: "var(--placeholder-border-color)",
        placeholderText: "var(--placeholder-text-color)",
        tableBorder: "var(--table-border-color)",
        tableThBg: "var(--table-th-bg-color)",
        tableThText: "var(--table-th-text-color)",
        tableThPadding: "var(--table-th-padding)",
        tableTdText: "var(--table-td-text-color)",
        tableRowAltBg: "var(--table-row-alt-bg-color)",
        dataText: "var(--data-text-color)",
        hrColor: "var(--hr-color)",
        scrollbarBg: "var(--scrollbar-bg-color)",
        scrollbarThumb: "var(--scrollbar-thumb-color)",
        scrollbarThumbHover: "var(--scrollbar-thumb-hover-color)"
      },
      gridTemplateColumns: {
        // Custom grid template columns for 15 columns
        15: "repeat(15, minmax(0, 1fr))"
      },
      height: {
        header: "4rem", // Centralized header height
        footer: "4rem" // Centralized footer height
      }
    }
  },
  plugins: []
};
