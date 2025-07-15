import bodyParser from "body-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import "./cron/paymentStatusChecker";
import errorHandler from "./middleware/errorHandler";
import AddressRouter from "./routes/address";
import AgentRouter from "./routes/agent";
import CategoryRouter from "./routes/category";
import DeliveryRouter from "./routes/delivery";
import FaqRouter from "./routes/faq";
import LogRouter from "./routes/log";
import NotificationRouter from "./routes/notification";
import OrderRouter from "./routes/order";
import OrderItemRouter from "./routes/orderItem";
import PaymentRouter from "./routes/payment";
import PermissionRouter from "./routes/permissions";
import ProductRouter from "./routes/product";
import ProductVariantRouter from "./routes/productVariant";
import PromotionRouter from "./routes/promotion";
import RoleRouter from "./routes/roles";
import ShopRouter from "./routes/shop";
import StockRouter from "./routes/stock";
import TopicRouter from "./routes/topic";
import usersRouter from "./routes/users";
import ZoneRouter from "./routes/zone";
import WinstonLogger from "./utils/logger";
import SettingRouter from "./routes/setting";

/**
 * Represents the main application server for the Loumo API.
 *
 * This class initializes and configures an Express application with middleware for security,
 * logging, CORS, and error handling. It registers all API route handlers for various resources,
 * such as users, roles, permissions, addresses, products, orders, and more.
 *
 * The server uses Winston for logging warnings and errors, Morgan for HTTP request logging,
 * Helmet for security headers, and body-parser for JSON payloads. All API endpoints are
 * prefixed with `/api/` and routed to their respective routers.
 *
 * To start the server, call the `start()` method, which listens on the configured port.
 */
export class Server {
  private PORT = 5000;
  app = express();
  private users = new usersRouter();
  private roles = new RoleRouter();
  private address = new AddressRouter();
  private zone = new ZoneRouter();
  private category = new CategoryRouter();
  private product = new ProductRouter();
  private productVariant = new ProductVariantRouter();
  private log = new LogRouter();
  private permission = new PermissionRouter();
  private notification = new NotificationRouter();
  private shop = new ShopRouter();
  private order = new OrderRouter();
  private orderitem = new OrderItemRouter();
  private agent = new AgentRouter();
  private delivery = new DeliveryRouter();
  private payment = new PaymentRouter();
  private stock = new StockRouter();
  private promotion = new PromotionRouter();
  private faq = new FaqRouter();
  private topic = new TopicRouter();
  private setting = new SettingRouter();

  private winstonLogger = new WinstonLogger();
  constructor() {
    this.app.use(helmet());
    this.app.use(
      cors({
        origin: "*", // your frontend's origin
        // origin: ["http://localhost:3000", "*"], // your frontend's origin
        credentials: true, // if you use cookies/auth headers
      })
    );

    this.rateLimiter();
    // console logger
    this.app.use(
      morgan(
        `:remote-addr - :remote-user [:date] :method :url HTTP/:http-version" :status :res[content-length] ":referrer"`
      )
    );

    // error and warning save to server
    this.app.use(this.winstonLogger.warningLogger());
    // error and warning save to server
    this.app.use(this.winstonLogger.warningLogger());

    // body parser
    this.app.use(bodyParser.json());

    // Routes
    this.health();
    this.routes();

    // error and warning save to server
    // this.app.use(this.winstonLogger.errorLogger());

    // Error Handler
    this.app.use(errorHandler);
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ error: "Route not found" });
    });
  }

  health() {
    this.app.get("/health", (req, res) => {
      res.status(200).json({ status: "ok" });
    });
  }

  rateLimiter() {
    // Set up rate limiter: maximum of 100 requests per 15 minutes per IP
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1500, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
      message:
        "Too many requests from this IP, please try again after 15 minutes",
    });
    this.app.use(limiter);
  }

  routes() {
    this.app.use("/api/users", this.users.routes);
    this.app.use("/api/roles", this.roles.routes);
    this.app.use("/api/permissions", this.permission.routes);
    this.app.use("/api/address", this.address.routes);
    this.app.use("/api/zones", this.zone.routes);
    this.app.use("/api/logs", this.log.routes);
    this.app.use("/api/categories", this.category.routes);
    this.app.use("/api/products", this.product.routes);
    this.app.use("/api/productvariants", this.productVariant.routes);
    this.app.use("/api/shops", this.shop.routes);
    this.app.use("/api/stocks", this.stock.routes);
    this.app.use("/api/promotions", this.promotion.routes);
    this.app.use("/api/orders", this.order.routes);
    this.app.use("/api/orderitems", this.orderitem.routes);
    this.app.use("/api/agents", this.agent.routes);
    this.app.use("/api/payments", this.payment.routes);
    this.app.use("/api/deliveries", this.delivery.routes);
    this.app.use("/api/notifications", this.notification.routes);
    this.app.use("/api/faqs", this.faq.routes);
    this.app.use("/api/topics", this.topic.routes);
    this.app.use("/api/settings", this.setting.routes);
    this.app.use("/api/uploads", express.static("uploads"));
  }

  errorMiddleware() {
    this.app.use(errorHandler);
  }

  start() {
    this.app.listen(this.PORT, () => {
      console.table(`⚙️  Running on Port ${this.PORT}`);
    });
  }
}

const myApp = new Server();

myApp.start();
