import AccessControl "./authorization/access-control";
import MixinAuthorization "./authorization/MixinAuthorization";
import Outcall "./http-outcalls/outcall";
import Map "mo:core/Map";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Prim "mo:prim";
import Array "mo:core/Array";

actor class AyurNexis() = self {

  let authState = AccessControl.initState();

  let DEEPSEEK_API_KEY : Text = "sk-2d7fcf900b344a198815df1f571fce11";
  let DEEPSEEK_URL : Text = "https://api.deepseek.com/v1/chat/completions";
  include MixinAuthorization(authState);

  public type AppRole = { #admin; #qaManager; #labTechnician };
  var appRoles : Map.Map<Principal, AppRole> = Map.empty<Principal, AppRole>();

  public shared ({ caller }) func setAppRole(user : Principal, role : AppRole) : async () {
    if (not AccessControl.isAdmin(authState, caller)) { Prim.trap("Unauthorized") };
    appRoles.add(user, role);
  };

  public query ({ caller }) func getMyAppRole() : async ?AppRole {
    appRoles.get(caller);
  };

  // ─── DeepSeek AI Proxy ──────────────────────────────────────────────────────────────────────────────────

  public query func _transform(input : Outcall.TransformationInput) : async Outcall.TransformationOutput {
    { input.response with headers = [] };
  };

  public shared func callDeepSeek(prompt : Text) : async Text {
    let escaped = escapeJsonSimple(prompt);
    let body = "{\"model\":\"deepseek-chat\",\"messages\":[{\"role\":\"user\",\"content\":\"" # escaped # "\"}],\"max_tokens\":1500,\"temperature\":0.7}";
    let headers : [Outcall.Header] = [
      { name = "Content-Type"; value = "application/json" },
      { name = "Authorization"; value = "Bearer " # DEEPSEEK_API_KEY },
    ];
    try {
      await Outcall.httpPostRequest(DEEPSEEK_URL, headers, body, _transform);
    } catch (e) {
      "{\"error\":\"" # Prim.errorMessage(e) # "\"}";
    };
  };

  // Longer token limit version for risk assessment
  public shared func callDeepSeekExtended(prompt : Text) : async Text {
    let escaped = escapeJsonSimple(prompt);
    let body = "{\"model\":\"deepseek-chat\",\"messages\":[{\"role\":\"user\",\"content\":\"" # escaped # "\"}],\"max_tokens\":2500,\"temperature\":0.4}";
    let headers : [Outcall.Header] = [
      { name = "Content-Type"; value = "application/json" },
      { name = "Authorization"; value = "Bearer " # DEEPSEEK_API_KEY },
    ];
    try {
      await Outcall.httpPostRequest(DEEPSEEK_URL, headers, body, _transform);
    } catch (e) {
      "{\"error\":\"" # Prim.errorMessage(e) # "\"}";
    };
  };

  func escapeJsonSimple(s : Text) : Text {
    var result = "";
    for (c in s.chars()) {
      let n = Prim.charToNat32(c);
      if (n == 34) { result #= "\\\"" }
      else if (n == 92) { result #= "\\\\" }
      else if (n == 10) { result #= "\\n" }
      else if (n == 13) { result #= "\\r" }
      else if (n == 9) { result #= "\\t" }
      else { result #= Prim.charToText(c) };
    };
    result;
  };

  // ─── AI Credit System ───────────────────────────────────────────────────────────────────────

  let ADMIN_TOKEN_CREDITS = "AYURNEXIS-ADMIN-TOKEN-2026";
  let _ADMIN_UNLIMITED_CREDITS : Nat = 999999;

  // Credits per userId; admin always has ADMIN_UNLIMITED_CREDITS
  var userCredits : Map.Map<Text, Nat> = Map.empty<Text, Nat>();

  public type RiskAuditEntry = {
    userId : Text;
    userName : Text;
    systemName : Text;
    riskScore : Nat;
    riskLevel : Text;
    creditsUsed : Nat;
    timestamp : Int;
  };

  var riskAuditLog : [RiskAuditEntry] = [];

  // Admin sets credits for a user
  public shared func setUserCredits(userId : Text, amount : Nat, adminToken : Text) : async Bool {
    if (adminToken != ADMIN_TOKEN_CREDITS) { return false };
    userCredits.add(userId, amount);
    true;
  };

  // Admin reads credits for a user
  public query func getUserCredits(userId : Text, adminToken : Text) : async Nat {
    if (adminToken != ADMIN_TOKEN_CREDITS) { return 0 };
    switch (userCredits.get(userId)) {
      case (?n) n;
      case (null) 0;
    };
  };

  // User reads their own credits (no admin token needed, by userId)
  public query func getUserOwnCredits(userId : Text) : async Nat {
    switch (userCredits.get(userId)) {
      case (?n) n;
      case (null) 0;
    };
  };

  // Get all user credit balances (admin only)
  public query func getAllUserCredits(adminToken : Text) : async [(Text, Nat)] {
    if (adminToken != ADMIN_TOKEN_CREDITS) { return [] };
    userCredits.entries().toArray();
  };

  // Deduct 1 credit; returns true if successful, false if no credits
  // userId = "ADMIN" gets unlimited
  public shared func deductCredit(userId : Text) : async Bool {
    if (userId == "ADMIN" or userId == "admin") { return true };
    switch (userCredits.get(userId)) {
      case (null) { return false };
      case (?n) {
        if (n == 0) { return false };
        userCredits.add(userId, Nat.sub(n, 1));
        true;
      };
    };
  };

  // Log a risk prediction run
  public shared func logRiskPrediction(
    userId : Text,
    userName : Text,
    systemName : Text,
    riskScore : Nat,
    riskLevel : Text,
  ) : async () {
    let now : Int = Prim.nat64ToNat(Prim.time());
    let entry : RiskAuditEntry = {
      userId;
      userName;
      systemName;
      riskScore;
      riskLevel;
      creditsUsed = 1;
      timestamp = now;
    };
    let oldLen = riskAuditLog.size();
    riskAuditLog := Array.tabulate<RiskAuditEntry>(oldLen + 1, func (i : Nat) : RiskAuditEntry {
      if (i < oldLen) riskAuditLog[i] else entry
    });
  };

  // Get risk audit log (admin only)
  public query func getRiskAuditLog(adminToken : Text) : async [RiskAuditEntry] {
    if (adminToken != ADMIN_TOKEN_CREDITS) { return [] };
    riskAuditLog;
  };

  // ─── Batch Module ────────────────────────────────────────────────────────────────────────────────

  public type Batch = {
    id : Nat;
    batchId : Text;
    herbName : Text;
    supplier : Text;
    region : Text;
    dateReceived : Text;
    moisture : Float;
    ash : Float;
    extractiveValue : Float;
    heavyMetals : Float;
    microbialCount : Float;
    notes : Text;
    createdBy : Principal;
  };

  public type BatchInput = {
    batchId : Text;
    herbName : Text;
    supplier : Text;
    region : Text;
    dateReceived : Text;
    moisture : Float;
    ash : Float;
    extractiveValue : Float;
    heavyMetals : Float;
    microbialCount : Float;
    notes : Text;
  };

  public type AnalysisResult = {
    batchId : Text;
    herbName : Text;
    supplier : Text;
    region : Text;
    dateReceived : Text;
    qualityScore : Float;
    status : Text;
    probability : Float;
    anomaly : Bool;
    anomalyDetails : Text;
    moistureOk : Bool;
    ashOk : Bool;
    extractiveOk : Bool;
    heavyMetalsOk : Bool;
    microbialOk : Bool;
    timestamp : Int;
  };

  var batches : Map.Map<Nat, Batch> = Map.empty<Nat, Batch>();
  var nextBatchId : Nat = 1;
  var analyses : Map.Map<Text, AnalysisResult> = Map.empty<Text, AnalysisResult>();

  public shared ({ caller }) func createBatch(input : BatchInput) : async Nat {
    let id = nextBatchId;
    nextBatchId += 1;
    batches.add(id, {
      id = id; batchId = input.batchId; herbName = input.herbName; supplier = input.supplier;
      region = input.region; dateReceived = input.dateReceived; moisture = input.moisture;
      ash = input.ash; extractiveValue = input.extractiveValue; heavyMetals = input.heavyMetals;
      microbialCount = input.microbialCount; notes = input.notes; createdBy = caller;
    });
    id;
  };

  public query func getBatch(id : Nat) : async ?Batch { batches.get(id) };

  public query func getAllBatches() : async [Batch] { batches.values().toArray() };

  public shared func updateBatch(id : Nat, input : BatchInput) : async Bool {
    switch (batches.get(id)) {
      case (null) { false };
      case (?existing) {
        batches.add(id, {
          id = id; batchId = input.batchId; herbName = input.herbName; supplier = input.supplier;
          region = input.region; dateReceived = input.dateReceived; moisture = input.moisture;
          ash = input.ash; extractiveValue = input.extractiveValue; heavyMetals = input.heavyMetals;
          microbialCount = input.microbialCount; notes = input.notes; createdBy = existing.createdBy;
        });
        true;
      };
    };
  };

  public shared ({ caller }) func deleteBatch(id : Nat) : async Bool {
    if (not AccessControl.isAdmin(authState, caller)) { Prim.trap("Unauthorized") };
    switch (batches.get(id)) {
      case (null) { false };
      case (?_) { batches.remove(id); true };
    };
  };

  func scoreParam(value : Float, threshold : Float, higherIsBetter : Bool) : Float {
    if (higherIsBetter) {
      if (value >= threshold) 20.0 else Float.max(0.0, 20.0 * (value / threshold));
    } else {
      if (value <= threshold) 20.0 else Float.max(0.0, 20.0 * (threshold / value));
    };
  };

  func runAnalysis(batch : Batch, ts : Int) : AnalysisResult {
    let mT = 12.0; let aT = 5.0; let eT = 15.0; let hT = 10.0; let mCT = 1000.0;
    let moistureOk = batch.moisture <= mT;
    let ashOk = batch.ash <= aT;
    let extractiveOk = batch.extractiveValue >= eT;
    let heavyMetalsOk = batch.heavyMetals <= hT;
    let microbialOk = batch.microbialCount <= mCT;
    let qualityScore = scoreParam(batch.moisture, mT, false) + scoreParam(batch.ash, aT, false)
      + scoreParam(batch.extractiveValue, eT, true) + scoreParam(batch.heavyMetals, hT, false)
      + scoreParam(batch.microbialCount, mCT, false);
    let anomaly = (batch.moisture > mT * 1.5) or (batch.ash > aT * 1.5)
      or (batch.heavyMetals > hT * 1.5) or (batch.microbialCount > mCT * 1.5);
    var anomalyDetails = "";
    if (batch.moisture > mT * 1.5)     { anomalyDetails #= "Moisture critically high. " };
    if (batch.ash > aT * 1.5)          { anomalyDetails #= "Ash critically high. " };
    if (batch.heavyMetals > hT * 1.5)  { anomalyDetails #= "Heavy metals critically high. " };
    if (batch.microbialCount > mCT * 1.5) { anomalyDetails #= "Microbial count critically high. " };
    {
      batchId = batch.batchId; herbName = batch.herbName; supplier = batch.supplier;
      region = batch.region; dateReceived = batch.dateReceived; qualityScore = qualityScore;
      status = if (qualityScore >= 65.0) "Accept" else "Reject";
      probability = qualityScore / 100.0; anomaly = anomaly; anomalyDetails = anomalyDetails;
      moistureOk = moistureOk; ashOk = ashOk; extractiveOk = extractiveOk;
      heavyMetalsOk = heavyMetalsOk; microbialOk = microbialOk; timestamp = ts;
    };
  };

  public shared func analyzeBatch(id : Nat) : async ?AnalysisResult {
    switch (batches.get(id)) {
      case (null) { null };
      case (?batch) {
        let ts : Int = Prim.nat64ToNat(Prim.time());
        let result = runAnalysis(batch, ts);
        analyses.add(batch.batchId, result);
        ?result;
      };
    };
  };

  public query func getAnalysis(batchId : Text) : async ?AnalysisResult { analyses.get(batchId) };
  public query func getAllAnalyses() : async [AnalysisResult] { analyses.values().toArray() };

  public type DashboardStats = {
    totalBatches : Nat; passCount : Nat; failCount : Nat;
    passRate : Float; openDeviations : Nat; avgQualityScore : Float;
  };

  public query func getDashboardStats() : async DashboardStats {
    let all = analyses.values().toArray();
    let total = all.size();
    var passCount = 0; var totalScore = 0.0; var deviations = 0;
    for (a in all.vals()) {
      if (a.status == "Accept") { passCount += 1 };
      totalScore += a.qualityScore;
      if (a.anomaly) { deviations += 1 };
    };
    let passRate = if (total == 0) 0.0 else passCount.toFloat() / total.toFloat() * 100.0;
    let avgScore = if (total == 0) 0.0 else totalScore / total.toFloat();
    { totalBatches = total; passCount; failCount = total - passCount; passRate; openDeviations = deviations; avgQualityScore = avgScore };
  };

  public type ScoreTrend = { batchId : Text; qualityScore : Float; timestamp : Int };

  public query func getScoreTrends() : async [ScoreTrend] {
    let all = analyses.values().toArray();
    let sorted = all.sort(func(a : AnalysisResult, b : AnalysisResult) : { #less; #equal; #greater } {
      if (a.timestamp < b.timestamp) #less else if (a.timestamp > b.timestamp) #greater else #equal;
    });
    let sz = sorted.size();
    let start = if (sz > 20) Nat.sub(sz, 20) else 0;
    sorted.sliceToArray(start, sz).map(func(a : AnalysisResult) : ScoreTrend {
      { batchId = a.batchId; qualityScore = a.qualityScore; timestamp = a.timestamp };
    });
  };

  public type SupplierStats = { supplier : Text; passRate : Float; avgScore : Float; totalBatches : Nat };

  public query func getSupplierStats() : async [SupplierStats] {
    let all = analyses.values().toArray();
    var sMap : Map.Map<Text, { var pass : Nat; var total : Nat; var scoreSum : Float }> = Map.empty();
    for (a in all.vals()) {
      switch (sMap.get(a.supplier)) {
        case (null) { sMap.add(a.supplier, { var pass = if (a.status == "Accept") 1 else 0; var total = 1; var scoreSum = a.qualityScore }) };
        case (?s) { if (a.status == "Accept") { s.pass += 1 }; s.total += 1; s.scoreSum += a.qualityScore };
      };
    };
    sMap.entries().map(func((sup, s) : (Text, { var pass : Nat; var total : Nat; var scoreSum : Float })) : SupplierStats {
      { supplier = sup; passRate = if (s.total == 0) 0.0 else s.pass.toFloat() / s.total.toFloat() * 100.0; avgScore = if (s.total == 0) 0.0 else s.scoreSum / s.total.toFloat(); totalBatches = s.total };
    }).toArray();
  };

  public type RiskBatch = { batchId : Text; herbName : Text; supplier : Text; qualityScore : Float; riskLevel : Text };

  public query func getRiskAssessment() : async [RiskBatch] {
    analyses.values().map(func(a : AnalysisResult) : RiskBatch {
      { batchId = a.batchId; herbName = a.herbName; supplier = a.supplier; qualityScore = a.qualityScore;
        riskLevel = if (a.qualityScore >= 80.0) "low" else if (a.qualityScore >= 65.0) "medium" else "high" };
    }).toArray();
  };

  public type QualityOverview = { total : Nat; passed : Nat; failed : Nat; avgScore : Float; highRisk : Nat };

  public query func getQualityOverview() : async QualityOverview {
    let all = analyses.values().toArray();
    var passed = 0; var failed = 0; var scoreSum = 0.0; var highRisk = 0;
    for (a in all.vals()) {
      if (a.status == "Accept") { passed += 1 } else { failed += 1 };
      scoreSum += a.qualityScore;
      if (a.qualityScore < 65.0) { highRisk += 1 };
    };
    let total = all.size();
    { total; passed; failed; avgScore = if (total == 0) 0.0 else scoreSum / total.toFloat(); highRisk };
  };

  public query func getDeviationReport() : async [AnalysisResult] {
    analyses.values().toArray().filter(func(a : AnalysisResult) : Bool {
      not a.moistureOk or not a.ashOk or not a.extractiveOk or not a.heavyMetalsOk or not a.microbialOk;
    });
  };

  public shared func seedDemoData() : async () {
    let seeds : [(Text, Text, Text, Text, Float, Float, Float, Float, Float, Text)] = [
      ("AYU-001", "Ashwagandha",  "HerbCo India",   "Rajasthan",      9.5,  3.2, 18.0,  4.0,  450.0, "Premium grade"),
      ("AYU-002", "Turmeric",     "SpiceLand",      "Tamil Nadu",    11.0,  4.8, 16.5,  7.5,  820.0, ""),
      ("AYU-003", "Brahmi",       "GreenHerbs",     "Kerala",        13.5,  5.8, 12.0,  9.0, 1200.0, "Borderline"),
      ("AYU-004", "Neem",         "HerbCo India",   "Rajasthan",      8.0,  2.5, 22.0,  2.0,  300.0, "Excellent"),
      ("AYU-005", "Shatavari",    "AyurSource",     "Madhya Pradesh",10.2,  3.8, 17.5,  5.5,  680.0, ""),
      ("AYU-006", "Triphala",     "SpiceLand",      "Tamil Nadu",    14.0,  6.5, 11.0, 11.0, 1500.0, "Rejected"),
      ("AYU-007", "Ginger",       "GreenHerbs",     "Kerala",         9.8,  4.1, 19.0,  3.5,  520.0, ""),
      ("AYU-008", "Tulsi",        "AyurSource",     "Madhya Pradesh",10.5,  3.5, 20.0,  4.2,  410.0, "High quality"),
    ];
    var offset = 0;
    for ((bid, herb, sup, reg, moist, ash, ext, hm, mc, notes) in seeds.vals()) {
      let id = nextBatchId;
      nextBatchId += 1;
      let batch : Batch = { id; batchId = bid; herbName = herb; supplier = sup; region = reg;
        dateReceived = "2026-0" # (offset + 1).toText() # "-15"; moisture = moist; ash = ash;
        extractiveValue = ext; heavyMetals = hm; microbialCount = mc; notes = notes;
        createdBy = Prim.principalOfBlob("") };
      batches.add(id, batch);
      let ts : Int = offset * 86_400_000_000_000;
      analyses.add(bid, runAnalysis(batch, ts));
      offset += 1;
    };
  };

  // ─── User Access Request System ───────────────────────────────────────────────────────

  let ADMIN_TOKEN = "AYURNEXIS-ADMIN-TOKEN-2026";

  public type UserRecord = {
    id : Text;
    name : Text;
    institution : Text;
    email : Text;
    purpose : Text;
    registeredAt : Int;
    status : Text;
    accessCode : ?Text;
    codeGeneratedAt : ?Int;
    approvedAt : ?Int;
  };

  var userRecords : Map.Map<Text, UserRecord> = Map.empty<Text, UserRecord>();
  var codeExpiryMap : Map.Map<Text, Nat> = Map.empty<Text, Nat>();

  public shared func submitAccessRequest(
    id : Text,
    name : Text,
    institution : Text,
    email : Text,
    purpose : Text,
    registeredAt : Int,
  ) : async Bool {
    switch (userRecords.get(id)) {
      case (?existing) {
        if (existing.status == "pending") {
          userRecords.add(id, {
            id; name; institution; email; purpose; registeredAt;
            status = "pending"; accessCode = null; codeGeneratedAt = null; approvedAt = null;
          });
          return true;
        };
        return false;
      };
      case (null) {};
    };
    userRecords.add(id, {
      id; name; institution; email; purpose; registeredAt;
      status = "pending"; accessCode = null; codeGeneratedAt = null; approvedAt = null;
    });
    true;
  };

  public query func getAccessRequests(adminToken : Text) : async [UserRecord] {
    if (adminToken != ADMIN_TOKEN) { return [] };
    userRecords.values().toArray();
  };

  public shared func adminApproveUser(userId : Text, adminToken : Text) : async Bool {
    if (adminToken != ADMIN_TOKEN) { return false };
    switch (userRecords.get(userId)) {
      case (null) { false };
      case (?u) {
        let now : Int = Prim.nat64ToNat(Prim.time());
        userRecords.add(userId, {
          id = u.id; name = u.name; institution = u.institution; email = u.email;
          purpose = u.purpose; registeredAt = u.registeredAt;
          status = "approved"; accessCode = u.accessCode;
          codeGeneratedAt = u.codeGeneratedAt; approvedAt = ?now;
        });
        true;
      };
    };
  };

  public shared func adminRevokeUser(userId : Text, adminToken : Text) : async Bool {
    if (adminToken != ADMIN_TOKEN) { return false };
    switch (userRecords.get(userId)) {
      case (null) { false };
      case (?u) {
        userRecords.add(userId, {
          id = u.id; name = u.name; institution = u.institution; email = u.email;
          purpose = u.purpose; registeredAt = u.registeredAt;
          status = "revoked"; accessCode = null;
          codeGeneratedAt = null; approvedAt = u.approvedAt;
        });
        true;
      };
    };
  };

  public shared func adminDeleteUser(userId : Text, adminToken : Text) : async Bool {
    if (adminToken != ADMIN_TOKEN) { return false };
    switch (userRecords.get(userId)) {
      case (null) { false };
      case (?_) { userRecords.remove(userId); codeExpiryMap.remove(userId); true };
    };
  };

  public shared func adminGenerateCode(userId : Text, adminToken : Text, expiryDays : Nat) : async ?Text {
    if (adminToken != ADMIN_TOKEN) { return null };
    switch (userRecords.get(userId)) {
      case (null) { null };
      case (?u) {
        let tNat = Prim.nat64ToNat(Prim.time());
        let code = ((tNat % 900000) + 100000).toText();
        let now : Int = tNat;
        codeExpiryMap.add(userId, expiryDays);
        userRecords.add(userId, {
          id = u.id; name = u.name; institution = u.institution; email = u.email;
          purpose = u.purpose; registeredAt = u.registeredAt;
          status = "approved"; accessCode = ?code;
          codeGeneratedAt = ?now; approvedAt = ?now;
        });
        ?code;
      };
    };
  };

  public query func verifyUserCode(email : Text, code : Text) : async ?Text {
    for (u in userRecords.values()) {
      if (u.email == email) {
        switch (u.accessCode) {
          case (?c) {
            if (c == code and u.status == "approved") {
              switch (u.codeGeneratedAt) {
                case (?genAt) {
                  let expiryD : Nat = switch (codeExpiryMap.get(u.id)) { case (?d) d; case (null) 30 };
                  let now : Int = Prim.nat64ToNat(Prim.time());
                  let expiryNs : Int = expiryD * 24 * 60 * 60 * 1_000_000_000;
                  if (now - genAt < expiryNs) {
                    return ?u.id;
                  };
                };
                case (null) {};
              };
            };
          };
          case (null) {};
        };
      };
    };
    null;
  };

  public query func getUserCodeExpiry(email : Text) : async ?(Int, Nat) {
    for (u in userRecords.values()) {
      if (u.email == email and u.status == "approved") {
        switch (u.codeGeneratedAt) {
          case (?genAt) {
            let expiryD : Nat = switch (codeExpiryMap.get(u.id)) { case (?d) d; case (null) 30 };
            return ?(genAt, expiryD);
          };
          case (null) {};
        };
      };
    };
    null;
  };

  public query func checkUserAccess(userId : Text) : async Text {
    switch (userRecords.get(userId)) {
      case (null) { "not_found" };
      case (?u) {
        if (u.status != "approved") { return u.status };
        switch (u.codeGeneratedAt) {
          case (null) { "no_code" };
          case (?genAt) {
            let expiryD : Nat = switch (codeExpiryMap.get(userId)) { case (?d) d; case (null) 30 };
            let now : Int = Prim.nat64ToNat(Prim.time());
            let expiryNs : Int = expiryD * 24 * 60 * 60 * 1_000_000_000;
            if (now - genAt >= expiryNs) { "expired" } else { "active" };
          };
        };
      };
    };
  };

  public query func getUserRecord(userId : Text, adminToken : Text) : async ?UserRecord {
    if (adminToken != ADMIN_TOKEN) { return null };
    userRecords.get(userId);
  };

}
