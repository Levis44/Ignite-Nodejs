import express from "express";

const app = express();

app.get("/", (request, response) => {
  return response.json({ mesage: "Opa" });
});

app.listen(3000, () => console.log("Server Running"));
