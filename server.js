const app = require('./app.js');
const port = 1339;
const model = require('./models/skiEquipmentModelMysql');
const uuid = require('uuid');
const sessions = {}

let dbName = process.argv[2];
if (!dbName) {
    dbName = 'skiEquipment_db';
}

model.initialize(dbName, true)
    .then(
        app.listen(port) // Run the server
);

class Session{
    constructor(sessionId, userId, userType, expiresAt){
        this.sessionId = sessionId;
        this.userId = userId;
        this.userType = userType;
        this.expiresAt = expiresAt;
    }
    isExpired(){
        this.expiresAt < (new Date());
    }
}

async function createSession(userId, userType, numMinutes) {
    // Generate a random UUID as the sessionId
    const sessionId = uuid.v4()
    // Set the expiry time as numMinutes (in milliseconds) after the current time
    const expiresAt = new Date(Date.now() + numMinutes * 60000);
    
    // Create a session object containing information about the user and expiry time
    const thisSession = new Session(sessionId, userId, userType, expiresAt);
    
    // Add the session information to the sessions map, using sessionId as the key
    await model.addSession(thisSession);

    return sessionId;
}
async function authenticateUser(request) {
    // If this request doesn't have any cookies, that means it isn't authenticated. Return null.
    if (!request.cookies) {
      return null;
    }
    // We can obtain the session token from the requests cookies, which come with every request
    const sessionId = request.cookies['sessionId']
    if (!sessionId) {
      // If the cookie is not set, return null
      return null;
    } 
    // We then get the session of the user from our session map
    userSession = await model.getCurrentSession(sessionId);
    if (!userSession) {
      return null;
    }    // If the session has expired, delete the session from our map and return null
    if (userSession.isExpired < (new Date())) {
      await model.deleteSessionById(sessionId);      
      return null;
    }
    return {sessionId, userSession}; // Successfully validated.
}
function authenticatedAdmin(session){
    if(session.userSession.userType == 'admin'){
        return true;
    }
    return false;
}
async function refreshSession(request, response) {
    const authenticatedSession = authenticateUser(request);
      if (!authenticatedSession) {
        res.render("error.hbs", {alertMessage: "Unauthorized access"});
      return;
    }
    // Create and store a new Session object that will expire in 2 minutes.
    const newSessionId = createSession(authenticatedSession.userSession.userId, authenticatedSession.userSession.username, authenticatedSession.userSession.userType, 5);
    // Delete the old entry in the session map 
    await model.deleteSessionById(authenticatedSession.sessionId);
    
    // Get the new session
    const newSession = await model.getCurrentSession(newSessionId);
    // Set the session cookie to the new id we generated, with a
    // renewed expiration time
    response.cookie("sessionId", newSessionId, { expires: newSession.expiresAt })
    response.cookie("userId", authenticatedSession.userSession.userId, { expires: newSession.expiresAt })
    response.cookie("username", authenticatedSession.userSession.username, { expires: newSession.expiresAt })
    response.cookie("userType", authenticatedSession.userSession.userType, { expires: newSession.expiresAt })
    
    return newSessionId;
}

module.exports = {
    createSession,
    authenticateUser,
    authenticatedAdmin,
    refreshSession
}    