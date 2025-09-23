import request from "supertest";
import express from "express";
import { Role } from "@/utils/helpers/constants";
import AccountService from "@/apis/user/services/account.service";
import AccountController from "@/apis/user/controllers/account.controller";

// ✅ On mocke la classe AccountService
jest.mock("@/apis/user/services/account.service");

// ✅ Mock middlewares pour bypasser l'auth, la validation, etc.
jest.mock("@/middlewares/authentication.middleware", () =>
  jest.fn((req, res, next) => {
    req.user = { _id: "fake-user-id", roles: [Role.RECRUTEUR] };
    next();
  })
);
jest.mock("@/middlewares/validateApiKey.middleware", () => jest.fn((req, res, next) => next()));
jest.mock("@/middlewares/authorization.middleware", () => ({
  hasRoles: () => (_req: any, _res: any, next: any) => next(),
}));
jest.mock("@/middlewares/validation.middleware", () => ({
  validationMiddleware: () => (req: any, res: any, _next: any) => {
    if (req.body && req.body.interest === undefined && req.url.includes("/interest")) {
      return res.status(400).json({ message: "Interest is required" });
    }
    if (req.body && req.body.status === undefined && req.url.includes("/updatestatus")) {
      return res.status(400).json({ message: "Status is required" });
    }
    _next();
  },
}));
jest.mock("@/utils/helpers/logout.helper", () => ({
  logoutHandler: jest.fn((req, res) => res.status(200).json({ message: "Account deleted successfully." })),
}));

describe("AccountController", () => {
  let app: express.Express;
  let accountServiceInstance: jest.Mocked<AccountService>;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // ✅ Création d'une instance mockée correctement typée
    accountServiceInstance = new (AccountService as jest.Mock<AccountService>)() as jest.Mocked<AccountService>;

    const controller = new AccountController();
    // ✅ Injection de notre instance mockée dans le controller
    (controller as any).accountService = accountServiceInstance;

    app.use(controller.router);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("GET /account → retourne le compte utilisateur", async () => {
    accountServiceInstance.getAccount.mockResolvedValueOnce({ id: "fake-user-id", fullName: "John Doe" });

    const res = await request(app).get("/account");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: "fake-user-id", fullName: "John Doe" });
    expect(accountServiceInstance.getAccount).toHaveBeenCalledWith({ id: "fake-user-id" });
  });

  it("PUT /account → met à jour le compte", async () => {
    accountServiceInstance.update.mockResolvedValueOnce(undefined);

    const res = await request(app).put("/account").send({ fullName: "New Name" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      updated: true,
      message: "Your account is updated successfully.",
    });
    expect(accountServiceInstance.update).toHaveBeenCalledWith({ fullName: "New Name" }, "fake-user-id");
  });

  it("PUT /account/password → met à jour le mot de passe", async () => {
    accountServiceInstance.updatePassword.mockResolvedValueOnce(undefined);

    const res = await request(app)
      .put("/account/password")
      .send({ oldPassword: "123456", newPassword: "abcdef" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Your password is updated successfully.");
    expect(accountServiceInstance.updatePassword).toHaveBeenCalledWith(
      { oldPassword: "123456", newPassword: "abcdef" },
      "fake-user-id"
    );
  });

  it("PATCH /account/complete → marque le compte comme complété", async () => {
    accountServiceInstance.markAccountAsCompleted.mockResolvedValueOnce(undefined);

    const res = await request(app).patch("/account/complete");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Account marked as completed.");
    expect(accountServiceInstance.markAccountAsCompleted).toHaveBeenCalledWith("fake-user-id");
  });

  it("DELETE /account → supprime le compte", async () => {
    accountServiceInstance.deleteAccount.mockResolvedValueOnce(undefined);

    const res = await request(app).delete("/account");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Account deleted successfully.");
    expect(accountServiceInstance.deleteAccount).toHaveBeenCalledWith("fake-user-id");
  });

  it("POST /account/reveal-fiscal → retourne le fiscalNumber si password correct", async () => {
    accountServiceInstance.revealFiscal.mockResolvedValueOnce("TN123456789");

    const res = await request(app).post("/account/reveal-fiscal").send({ password: "secret" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, fiscalNumber: "TN123456789" });
    expect(accountServiceInstance.revealFiscal).toHaveBeenCalledWith("fake-user-id", "secret");
  });

  it("POST /account/reveal-fiscal → 400 si password manquant", async () => {
    const res = await request(app).post("/account/reveal-fiscal").send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Password is required");
    expect(accountServiceInstance.revealFiscal).not.toHaveBeenCalled();
  });

  it("POST /account/reveal-fiscal → 401 si mauvais mot de passe", async () => {
    accountServiceInstance.revealFiscal.mockResolvedValueOnce(null);

    const res = await request(app).post("/account/reveal-fiscal").send({ password: "wrong" });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Incorrect password");
    expect(accountServiceInstance.revealFiscal).toHaveBeenCalledWith("fake-user-id", "wrong");
  });
});
