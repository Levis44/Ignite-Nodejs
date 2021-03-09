const express = require('express');
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const customers = []

// Midleware
function verifyIfExistsAccountCPF(request, response, next) {
    const { cpf } = request.headers;

    const customer = customers.find(customer => customer.cpf === cpf);

    if(!customer) {
        return response.status(400).json({ error: "Customer not found" })
    }

    request.customer = customer;

    return next();
}
                    // recebe o array
function getBalance(customer, statement) {

    const balance = customer.balance;
    const type = statement.type;
    const amount = statement.amount;
    
    if(type === "credit") {
        const add = balance + amount;
        customer.balance = add;
        return add;
    } else {
        const sub = balance - amount;
        customer.balance = sub;
        return sub;
    }

    // const balance = statement.reduce((acc, operation) => {
    //     if(operation.type === "credit") {
    //         return acc + operation.amount;
    //     } else {
    //         return acc - operation.amount;
    //     }
    // }, 0);

    // return balance 
}


/**
 * cpf - string
 * name - string
 * id - uuid
 * statement - []
 * balance - number
 */

app.post("/account", (request, response) => {
    const { cpf, name } = request.body;

    const customerAlredyExists = customers.some(
        (customer) => customer.cpf === cpf
    )

    if(customerAlredyExists) {
        return response.status(400).json({ error: "Customer alredy exists!"})
    }

    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: [],
        balance: 0
    })
    return response.status(201).send()

});

app.get("/statement", verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;
    console.log(customer);
    return response.json(customer.statement);
});

app.post("/deposit", verifyIfExistsAccountCPF, (request, response) => {
    const { description, amount } = request.body;
    const { customer } = request;

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit"
    }

    customer.statement.push(statementOperation);

    getBalance(customer, statementOperation);

    return response.status(201).send()
});

app.post("/withdraw", verifyIfExistsAccountCPF, (request, response) => {
    const { amount } = request.body;
    const { customer } = request;

    const balance = customer.balance;
    console.log(balance);

    if(balance < amount) {
        return response.status(400).json({ error: "Insufficient funds"})
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: "debit"
    }

    customer.statement.push(statementOperation);

    getBalance(customer, statementOperation);


    return response.status(201).send()

});

app.get("/statement/date", verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;
    const { date } = request.query;

    const dateFormat = new Date(date + " 00:00");

    const statement = customer.statement.filter(
        statement =>
        statement.created_at.toDateString() === dateFormat.toDateString()
    )

    return response.json(statement);
});

app.put("/account", verifyIfExistsAccountCPF, (request, response) => {
    const {name} = request.body;
    const { customer } = request;

    customer.name = name;

    return response.status(201).send()
});

app.get("/account", verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;

    return response.send(customer)
})

app.delete("/account", verifyIfExistsAccountCPF, (request, response) => {
    const {customer} = request;

    customers.splice(customer, 1);

    return response.status(200).json(customers)
})

app.get("/balance", verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;

    // const balance = getBalance(customer.statement);

    const balance = customer.balance;

    return response.json(balance);
})


app.listen(3000, () => console.log("Server rodando"))