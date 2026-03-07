import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const db = new Database("timez.db");

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    business_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    sku TEXT,
    quantity INTEGER DEFAULT 0,
    price REAL,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name TEXT,
    client_email TEXT,
    amount REAL,
    status TEXT, -- 'pending', 'paid', 'overdue'
    due_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER,
    description TEXT,
    quantity INTEGER,
    unit_price REAL,
    FOREIGN KEY(invoice_id) REFERENCES invoices(id)
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    amount REAL,
    description TEXT,
    date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS payroll (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_name TEXT,
    role TEXT,
    salary REAL,
    tax_deduction REAL,
    net_pay REAL,
    payment_date DATE
  );

  -- Seed Initial Data if empty
  INSERT OR IGNORE INTO inventory (name, sku, quantity, price, category) 
  SELECT 'Office Chair', 'OFF-001', 15, 45000, 'Furniture'
  WHERE (SELECT COUNT(*) FROM inventory) = 0;

  INSERT OR IGNORE INTO inventory (name, sku, quantity, price, category) 
  SELECT 'Laptop Pro', 'TECH-002', 5, 850000, 'Electronics'
  WHERE (SELECT COUNT(*) FROM inventory) = 0;

  INSERT OR IGNORE INTO expenses (category, amount, description, date)
  SELECT 'Utilities', 15000, 'Monthly Electricity Bill', '2026-03-01'
  WHERE (SELECT COUNT(*) FROM expenses) = 0;

  INSERT OR IGNORE INTO payroll (employee_name, role, salary, tax_deduction, net_pay, payment_date)
  SELECT 'John Doe', 'Manager', 250000, 25000, 225000, '2026-02-28'
  WHERE (SELECT COUNT(*) FROM payroll) = 0;
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Middleware (Simple for single user)
  const auth = (req: any, res: any, next: any) => {
    // In a real app, use JWT. For this demo, we'll use a simple header for "session"
    const userId = req.headers['x-user-id'];
    if (!userId && req.path !== '/api/login' && req.path !== '/api/setup') {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };

  // API Routes
  app.post("/api/setup", (req, res) => {
    const { username, password, businessName } = req.body;
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
    if (userCount.count > 0) {
      return res.status(400).json({ error: "System already setup. Only one user allowed." });
    }
    const result = db.prepare("INSERT INTO users (username, password, business_name) VALUES (?, ?, ?)").run(username, password, businessName);
    res.json({ id: result.lastInsertRowid });
  });

  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password) as any;
    if (user) {
      res.json({ id: user.id, username: user.username, businessName: user.business_name });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.get("/api/check-setup", (req, res) => {
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
    res.json({ isSetup: userCount.count > 0 });
  });

  // Inventory
  app.get("/api/inventory", auth, (req, res) => {
    const items = db.prepare("SELECT * FROM inventory").all();
    res.json(items);
  });

  app.post("/api/inventory", auth, (req, res) => {
    const { name, sku, quantity, price, category } = req.body;
    const result = db.prepare("INSERT INTO inventory (name, sku, quantity, price, category) VALUES (?, ?, ?, ?, ?)").run(name, sku, quantity, price, category);
    res.json({ id: result.lastInsertRowid });
  });

  // Invoices
  app.get("/api/invoices", auth, (req, res) => {
    const invoices = db.prepare("SELECT * FROM invoices ORDER BY created_at DESC").all();
    res.json(invoices);
  });

  app.post("/api/invoices", auth, (req, res) => {
    const { client_name, client_email, amount, status, due_date, items } = req.body;
    const insertInvoice = db.transaction((invoiceData: any) => {
      const result = db.prepare("INSERT INTO invoices (client_name, client_email, amount, status, due_date) VALUES (?, ?, ?, ?, ?)").run(
        invoiceData.client_name, invoiceData.client_email, invoiceData.amount, invoiceData.status, invoiceData.due_date
      );
      const invoiceId = result.lastInsertRowid;
      const insertItem = db.prepare("INSERT INTO invoice_items (invoice_id, description, quantity, unit_price) VALUES (?, ?, ?, ?)");
      for (const item of invoiceData.items) {
        insertItem.run(invoiceId, item.description, item.quantity, item.unit_price);
      }
      return invoiceId;
    });
    const id = insertInvoice({ client_name, client_email, amount, status, due_date, items });
    res.json({ id });
  });

  // Expenses
  app.get("/api/expenses", auth, (req, res) => {
    const expenses = db.prepare("SELECT * FROM expenses ORDER BY date DESC").all();
    res.json(expenses);
  });

  app.post("/api/expenses", auth, (req, res) => {
    const { category, amount, description, date } = req.body;
    const result = db.prepare("INSERT INTO expenses (category, amount, description, date) VALUES (?, ?, ?, ?)").run(category, amount, description, date);
    res.json({ id: result.lastInsertRowid });
  });

  // Payroll
  app.get("/api/payroll", auth, (req, res) => {
    const payroll = db.prepare("SELECT * FROM payroll ORDER BY payment_date DESC").all();
    res.json(payroll);
  });

  app.post("/api/payroll", auth, (req, res) => {
    const { employee_name, role, salary, tax_deduction, net_pay, payment_date } = req.body;
    const result = db.prepare("INSERT INTO payroll (employee_name, role, salary, tax_deduction, net_pay, payment_date) VALUES (?, ?, ?, ?, ?, ?)").run(
      employee_name, role, salary, tax_deduction, net_pay, payment_date
    );
    res.json({ id: result.lastInsertRowid });
  });

  // Reports
  app.get("/api/reports/profit-loss", auth, (req, res) => {
    const income = db.prepare("SELECT SUM(amount) as total FROM invoices WHERE status = 'paid'").get() as any;
    const expenses = db.prepare("SELECT SUM(amount) as total FROM expenses").get() as any;
    const payroll = db.prepare("SELECT SUM(net_pay + tax_deduction) as total FROM payroll").get() as any;
    
    const totalIncome = income.total || 0;
    const totalExpenses = (expenses.total || 0) + (payroll.total || 0);
    
    res.json({
      income: totalIncome,
      expenses: totalExpenses,
      profit: totalIncome - totalExpenses
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
