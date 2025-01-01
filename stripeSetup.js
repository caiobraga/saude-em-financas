var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
if (process.env.NODE_ENV === 'production') {
    require('dotenv').config(); // Load from .env in production
}
else {
    require('dotenv').config({ path: '.env' }); // Load from .env.local in development
}
var Stripe = require('stripe');
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// Configuration
var PUBLIC_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";
var CURRENCY = 'usd';
var IS_PRODUCTION = process.env.NODE_ENV === 'production';
// Product Plans
var plans = [
    {
        name: IS_PRODUCTION ? 'Basic' : 'Basic-Test',
        price: 150000, // price in cents
        description: 'Perfect for small teams and individuals',
        features: [
            'Up to 10 GB of history data',
            'Up to 1000 messages a day',
            'Up to 1000 API calls'
        ]
    },
    {
        name: IS_PRODUCTION ? 'Pro' : 'Pro-Test',
        price: 280000,
        description: 'Great for growing teams',
        features: [
            'Up to 100 GB of history data',
            'Up to 10000 messages a day',
            'Up to 10000 API calls'
        ]
    },
    {
        name: IS_PRODUCTION ? 'Enterprise' : 'Enterprise-Test',
        price: 420000,
        description: 'For large organizations',
        features: [
            'Unlimited history data',
            'Unlimited messages a day',
            'Unlimited API calls'
        ]
    }
];
// Helper Functions
function createProduct(plan) {
    return __awaiter(this, void 0, void 0, function () {
        var existingProducts, product;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, stripe.products.list({ active: true })];
                case 1:
                    existingProducts = _a.sent();
                    product = existingProducts.data.find(function (p) { return p.name === plan.name; });
                    if (!!product) return [3 /*break*/, 3];
                    return [4 /*yield*/, stripe.products.create({
                        name: plan.name,
                        description: plan.description,
                        metadata: {
                            features: JSON.stringify(plan.features)
                        }
                    })];
                case 2:
                    // Create new product if it doesn't exist
                    product = _a.sent();
                    console.log("Created product: ".concat(plan.name));
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, stripe.products.update(product.id, {
                    description: plan.description,
                    metadata: {
                        features: JSON.stringify(plan.features)
                    }
                })];
                case 4:
                    // Update existing product's features
                    product = _a.sent();
                    console.log("Updated product: ".concat(plan.name));
                    _a.label = 5;
                case 5: return [2 /*return*/, product];
            }
        });
    });
}
function createPrice(product, plan) {
    return __awaiter(this, void 0, void 0, function () {
        var existingPrices, price;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, stripe.prices.list({
                    product: product.id,
                    active: true
                })];
                case 1:
                    existingPrices = _a.sent();
                    if (!(existingPrices.data.length === 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, stripe.prices.create({
                        product: product.id,
                        unit_amount: plan.price,
                        currency: CURRENCY,
                        recurring: { interval: 'month' }
                    })];
                case 2:
                    price = _a.sent();
                    // Set as default price
                    return [4 /*yield*/, stripe.products.update(product.id, {
                        default_price: price.id
                    })];
                case 3:
                    // Set as default price
                    _a.sent();
                    console.log("Created price for ".concat(plan.name, ": ").concat(price.id));
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function setupWebhook() {
    return __awaiter(this, void 0, void 0, function () {
        var webhooks, webhookUrl;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Skip webhook setup in development
                    if (!IS_PRODUCTION) {
                        console.log('Skipping webhook setup in development');
                        console.log('Use Stripe CLI for local testing: https://stripe.com/docs/stripe-cli');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, stripe.webhookEndpoints.list()];
                case 1:
                    webhooks = _a.sent();
                    webhookUrl = "".concat(PUBLIC_URL, "/webhook/stripe");
                    if (!!webhooks.data.some(function (webhook) { return webhook.url === webhookUrl; })) return [3 /*break*/, 3];
                    return [4 /*yield*/, stripe.webhookEndpoints.create({
                        enabled_events: [
                            'customer.subscription.created',
                            'customer.subscription.deleted',
                            'customer.subscription.updated'
                        ],
                        url: webhookUrl,
                    })];
                case 2:
                    _a.sent();
                    console.log('Created webhook endpoint');
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Main Setup Function
function setupStripe() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, plans_1, plan, product, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    console.log("Setting up Stripe in ".concat(IS_PRODUCTION ? 'production' : 'development', " mode..."));
                    _i = 0, plans_1 = plans;
                    _a.label = 1;
                case 1:
                    if (!(_i < plans_1.length)) return [3 /*break*/, 5];
                    plan = plans_1[_i];
                    return [4 /*yield*/, createProduct(plan)];
                case 2:
                    product = _a.sent();
                    return [4 /*yield*/, createPrice(product, plan)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5:
                    // Setup webhook
                    return [4 /*yield*/, setupWebhook()];
                case 6:
                    // Setup webhook
                    _a.sent();
                    console.log('Stripe setup completed successfully');
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _a.sent();
                    console.error('Error setting up Stripe:', error_1);
                    throw error_1;
                case 8: return [2 /*return*/];
            }
        });
    });
}
// Run Setup
setupStripe().catch(console.error);
