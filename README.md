Sure, here's the markdown version of the readme file:

# GeoConverter

This is a web-based GeoConverter tool built using VueJS 3, Yarn and Vite. It allows users to convert Shapefiles into ISOXML Taskdata, which can be used in agricultural machinery.

## Getting Started

### Prerequisites

- Node.js (v14.16.0 or later)
- Yarn package manager (v1.22.10 or later)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-username/geoconverter.git
   ```

2. Install the dependencies:

   ```
   cd geoconverter
   yarn install
   ```

### Development

To run the GeoConverter in development mode, use the following command:

```
yarn dev
```

This will start a development server and open the app in your default browser. Any changes you make to the code will automatically trigger a reload in the browser.

### Production

To build the GeoConverter for production, use the following command:

```
yarn build
```

This will generate a production-ready build of the app in the `dist` directory.

### Usage

To use the GeoConverter, simply drag and drop one or more Shapefiles into the drop zone. The app will then convert the Shapefile(s) into ISOXML Taskdata, which can be downloaded by clicking the "Download" button.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Acknowledgments

- [VueJS](https://vuejs.org/) - The progressive JavaScript framework used for building the app
- [Vite](https://vitejs.dev/) - The build tool used for the development and production builds
- [ShpJS](https://github.com/calvinmetcalf/shapefile-js) - The library used for parsing Shapefiles
- [Isoxml-js](https://github.com/progis-ags/isoxml-js) - The library used for generating ISOXML Taskdata