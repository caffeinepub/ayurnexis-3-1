// Migration module: drops the legacy `authState` stable variable
// that was owned by the caffeineai-authorization package (now removed).
// All other stable fields are passed through unchanged.
import Map "mo:core/Map";

module {
  // Old types defined inline from the .old snapshot
  type UserRole = { #admin; #guest; #user };
  type OldAuthState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, UserRole>;
  };

  type AppRole = { #admin; #qaManager; #labTechnician };
  type AnalysisResult = {
    anomaly : Bool;
    anomalyDetails : Text;
    ashOk : Bool;
    batchId : Text;
    dateReceived : Text;
    extractiveOk : Bool;
    heavyMetalsOk : Bool;
    herbName : Text;
    microbialOk : Bool;
    moistureOk : Bool;
    probability : Float;
    qualityScore : Float;
    region : Text;
    status : Text;
    supplier : Text;
    timestamp : Int;
  };
  type Batch = {
    ash : Float;
    batchId : Text;
    createdBy : Principal;
    dateReceived : Text;
    extractiveValue : Float;
    heavyMetals : Float;
    herbName : Text;
    id : Nat;
    microbialCount : Float;
    moisture : Float;
    notes : Text;
    region : Text;
    supplier : Text;
  };
  type RiskAuditEntry = {
    creditsUsed : Nat;
    riskLevel : Text;
    riskScore : Nat;
    systemName : Text;
    timestamp : Int;
    userId : Text;
    userName : Text;
  };
  type UserRecord = {
    accessCode : ?Text;
    approvedAt : ?Int;
    codeGeneratedAt : ?Int;
    email : Text;
    id : Text;
    institution : Text;
    name : Text;
    purpose : Text;
    registeredAt : Int;
    status : Text;
  };

  type OldActor = {
    // Consumed but dropped (caffeineai-authorization removed)
    authState : OldAuthState;
    // Pass-through fields
    var analyses : Map.Map<Text, AnalysisResult>;
    var appRoles : Map.Map<Principal, AppRole>;
    var batches : Map.Map<Nat, Batch>;
    var codeExpiryMap : Map.Map<Text, Nat>;
    var nextBatchId : Nat;
    var riskAuditLog : [RiskAuditEntry];
    var userCredits : Map.Map<Text, Nat>;
    var userRecords : Map.Map<Text, UserRecord>;
    // Immutable constants — consumed and dropped (now `let` in new actor)
    ADMIN_TOKEN : Text;
    ADMIN_TOKEN_CREDITS : Text;
    DEEPSEEK_API_KEY : Text;
    DEEPSEEK_URL : Text;
    _ADMIN_UNLIMITED_CREDITS : Nat;
  };

  type NewActor = {
    var analyses : Map.Map<Text, AnalysisResult>;
    var appRoles : Map.Map<Principal, AppRole>;
    var batches : Map.Map<Nat, Batch>;
    var codeExpiryMap : Map.Map<Text, Nat>;
    var nextBatchId : Nat;
    var riskAuditLog : [RiskAuditEntry];
    var userCredits : Map.Map<Text, Nat>;
    var userRecords : Map.Map<Text, UserRecord>;
  };

  public func run(old : OldActor) : NewActor {
    {
      var analyses = old.analyses;
      var appRoles = old.appRoles;
      var batches = old.batches;
      var codeExpiryMap = old.codeExpiryMap;
      var nextBatchId = old.nextBatchId;
      var riskAuditLog = old.riskAuditLog;
      var userCredits = old.userCredits;
      var userRecords = old.userRecords;
    };
  };
};
