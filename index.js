const fs = require("fs");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const productIdsFile = "./data/product_id_list.txt";
const productDataFile = "./data/product_data.txt";
const productListCsvFile = "./data/product_list.csv";

const config = {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    },
};

let headers = [];
let listProduct = [];
const crawlAllProduct = async () => {
    const url = "https://tiki.vn/api/personalish/v1/blocks/listings";
    const response = await fetch(url + "?category=1794&urlKey=may-tinh-bang", config);
    const data = await response.json();
    const productIdList = data.data.map(product => product.id);
    saveProductIds(productIdList);
    for (let i = 0; i < productIdList.length; i++) {
        const productId = productIdList[i];
        await crawlProductDetail(productId);
    }
    saveProductList(listProduct);
}

const saveProductIds = (productsIds) => {
    !fs.existsSync('./data') && fs.mkdirSync('./data');
    const str = productsIds.join("\n");
    fs.writeFile(productIdsFile, str, (err) => {
        if (err) {
            console.log("Error when save productIds", err);
        }
        fs.readFile(productIdsFile, (err, data) => {
            if (err) {
                console.log("Error when read productIds", err);
            }
            console.log("ProductIds", data);
        })
    })
}

const crawlProductDetail = async (productId) => {
    const url = "https://tiki.vn/api/v2/products/" + productId;
    const response = await fetch(url, config);
    const data = await response.json();
    !headers.length && (headers = [...Object.keys(data).map(key => ({ id: key, title: key }))]);
    listProduct.push(data);
}

const saveProductDetail = (product) => {
    fs.writeFile(productDataFile, JSON.stringify(product), (err) => {
        if (err) {
            console.log("Error when save product", err);
        }
        fs.readFile(productDataFile, (err, data) => {
            if (err) {
                console.log("Error when read product", err);
            }
            console.log("product", data);
        })
    })
}

const saveProductList = async (productList) => {
    !fs.existsSync('./data') && fs.mkdirSync('./data');
    const csvWriter = createCsvWriter({
        path: productListCsvFile,
        header: headers
    });

    await csvWriter.writeRecords(productList)
}

crawlAllProduct();