const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const crypto = require("crypto");

const User = require("../models/User");
const { MockUser } = require("../models/mockStore");

const AlumniProfile = require("../models/AlumniProfile");

const StudentProfile = require("../models/StudentProfile");



// ============================================================

// HELPERS

// ============================================================



const createToken = (user) => {

    const jwtSecret =

        process.env.JWT_SECRET ||

        "alevate_jwt_secret_dev_key_2026";



    return jwt.sign(

        {

            userId: user._id || user.id,

            role: user.role

        },

        jwtSecret,

        {

            expiresIn: "7d"

        }

    );

};



const getFrontendUrl = () =>

    process.env.FRONTEND_URL ||

    "http://localhost:3000";



const getCookieValue = (req, cookieName) => {

    const cookieHeader = req.headers.cookie || "";



    const cookie = cookieHeader

        .split(";")

        .map((item) => item.trim())

        .find((item) =>

            item.startsWith(`${cookieName}=`)

        );



    if (!cookie) return null;



    return decodeURIComponent(

        cookie.substring(

            `${cookieName}=`.length

        )

    );

};



const setOAuthStateCookie = (

    res,

    name,

    value

) => {

    res.setHeader(

        "Set-Cookie",

        `${name}=${encodeURIComponent(

            value

        )}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600`

    );

};



const clearOAuthStateCookie = (

    res,

    name

) => {

    res.setHeader(

        "Set-Cookie",

        `${name}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`

    );

};



const safeUser = (user) => ({

    id: user._id || user.id,

    name: user.name,

    email: user.email,

    role: user.role,

    isVerified:

        user.isVerified !== undefined

            ? user.isVerified

            : true,

    profileImage:

        user.profileImage || ""

});



// ============================================================

// REGISTER

// ============================================================



const registerUser = async (req, res) => {

    try {

        const {

            name,

            email,

            password,

            role,

            company,

            jobTitle,

            experience,

            skills,

            bio,

            college,

            department

        } = req.body;



        if (!name || !email || !password) {

            return res.status(400).json({

                success: false,

                message:

                    "Name, email and password are required"

            });

        }



        const normalizedEmail =

            email.toLowerCase().trim();



        const existingUser =

            await User.findOne({

                email: normalizedEmail

            });



        if (existingUser) {

            return res.status(409).json({

                success: false,

                message:

                    "User already exists with this email address"

            });

        }



        const hashedPassword =

            await bcrypt.hash(password, 10);



        const isAlumni =

            role === "alumni";



        const isVerified =

            !isAlumni;



        const user =

            await User.create({

                name,

                email: normalizedEmail,

                password: hashedPassword,

                role: role || "student",

                isVerified

            });



        if (isAlumni) {

            const parsedSkills =

                Array.isArray(skills)

                    ? skills

                    : skills

                        ? skills

                            .split(",")

                            .map((s) =>

                                s.trim()

                            )

                            .filter(Boolean)

                        : [

                            "Software Engineering"

                        ];



            await AlumniProfile.create({

                user:

                    user._id ||

                    user.id,

                company:

                    company ||

                    "Independent / Industry",

                jobTitle:

                    jobTitle ||

                    "Professional",

                experience:

                    Number(experience) || 1,

                skills:

                    parsedSkills,

                expertise: [

                    "Mentorship",

                    "Career Guidance"

                ],

                industry:

                    "Technology",

                bio:

                    bio ||

                    `Alumni with ${

                        experience || 1

                    } years of experience in the tech industry.`

            });

        } else {

            await StudentProfile.create({

                user:

                    user._id ||

                    user.id,

                college:

                    college ||

                    "College of Engineering",

                department:

                    department ||

                    "Computer Science",

                graduationYear: 2026,

                skills: [

                    "Software Development"

                ]

            });

        }



        const token =

            createToken(user);



        return res.status(201).json({

            success: true,

            message: isAlumni

                ? "Alumni account registered! Your account is pending administrator verification of your skills and experience."

                : "Student registered successfully! Welcome to Alevate.",

            token,

            user: safeUser(user)

        });

    } catch (error) {

        console.error(

            "Registration error:",

            error

        );



        return res.status(500).json({

            success: false,

            message:

                "Registration failed",

            error: error.message

        });

    }

};



// ============================================================

// LOGIN

// ============================================================



const loginUser = async (req, res) => {

    try {

        const {

            email,

            password

        } = req.body;



        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:

                    "Email and password are required"

            });

        }



        const normalizedEmail =

            email.toLowerCase().trim();



        // The original ALEVATE demo administrator is intentionally stored

        // in the in-memory mock store, not in MongoDB. Keep that existing

        // admin account working even when MongoDB is connected.



        const user =

            normalizedEmail === "admin@alevate.edu"

                ? await MockUser.findOne({

                    email: normalizedEmail

                })

                : await User.findOne({

                    email: normalizedEmail

                });



        if (!user) {

            return res.status(401).json({

                success: false,

                message:

                    "Invalid email or password"

            });

        }



        if (!user.password) {

            return res.status(401).json({

                success: false,

                message:

                    "This account uses social Sign-In. Please continue with Google or GitHub."

            });

        }



        const isPasswordValid =

            await bcrypt.compare(

                password,

                user.password

            );



        if (!isPasswordValid) {

            return res.status(401).json({

                success: false,

                message:

                    "Invalid email or password"

            });

        }



        if (user.isActive === false) {

            return res.status(403).json({

                success: false,

                message:

                    "Your account is currently inactive."

            });

        }



        const token =

            createToken(user);



        return res.status(200).json({

            success: true,

            message:

                "Login successful",

            token,

            user: safeUser(user)

        });

    } catch (error) {

        console.error(

            "Login error:",

            error

        );



        return res.status(500).json({

            success: false,

            message:

                "Login failed",

            error: error.message

        });

    }

};



// ============================================================

// GOOGLE LOGIN - START

// ============================================================



const googleAuth = async (

    req,

    res

) => {

    try {

        const clientId =

            process.env.GOOGLE_CLIENT_ID;



        const callbackUrl =

            process.env.GOOGLE_CALLBACK_URL ||

            "http://localhost:3000/api/auth/google/callback";



        if (!clientId) {

            return res.status(500).json({

                success: false,

                message:

                    "GOOGLE_CLIENT_ID is not configured"

            });

        }



        const state =

            crypto.randomBytes(32)

                .toString("hex");



        setOAuthStateCookie(

            res,

            "google_oauth_state",

            state

        );



        const params =

            new URLSearchParams({

                client_id: clientId,

                redirect_uri:

                    callbackUrl,

                response_type:

                    "code",

                scope:

                    "openid email profile",

                state,

                access_type:

                    "online",

                prompt:

                    "select_account"

            });



        return res.redirect(

            `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

        );

    } catch (error) {

        console.error(

            "Google OAuth start error:",

            error

        );



        return res.status(500).json({

            success: false,

            message:

                "Unable to start Google Sign-In"

        });

    }

};



// ============================================================

// GOOGLE LOGIN - CALLBACK

// ============================================================



const googleCallback = async (

    req,

    res

) => {

    try {

        const {

            code,

            state,

            error

        } = req.query;



        const frontendUrl =

            getFrontendUrl();



        if (error) {

            console.error(

                "Google OAuth error:",

                error

            );



            return res.redirect(

                `${frontendUrl}/?google_error=${encodeURIComponent(error)}`

            );

        }



        if (!code || !state) {

            return res.redirect(

                `${frontendUrl}/?google_error=missing_oauth_response`

            );

        }



        const storedState =

            getCookieValue(

                req,

                "google_oauth_state"

            );



        if (

            !storedState ||

            storedState !== state

        ) {

            console.error(

                "Google OAuth state mismatch"

            );



            return res.redirect(

                `${frontendUrl}/?google_error=invalid_oauth_state`

            );

        }



        clearOAuthStateCookie(

            res,

            "google_oauth_state"

        );



        const clientId =

            process.env.GOOGLE_CLIENT_ID;



        const clientSecret =

            process.env.GOOGLE_CLIENT_SECRET;



        const callbackUrl =

            process.env.GOOGLE_CALLBACK_URL ||

            "http://localhost:3000/api/auth/google/callback";



        if (

            !clientId ||

            !clientSecret

        ) {

            throw new Error(

                "Google OAuth credentials are not configured"

            );

        }



        const tokenResponse =

            await fetch(

                "https://oauth2.googleapis.com/token",

                {

                    method: "POST",

                    headers: {

                        "Content-Type":

                            "application/x-www-form-urlencoded"

                    },

                    body:

                        new URLSearchParams({

                            code,

                            client_id:

                                clientId,

                            client_secret:

                                clientSecret,

                            redirect_uri:

                                callbackUrl,

                            grant_type:

                                "authorization_code"

                        })

                }

            );



        const tokenData =

            await tokenResponse.json();



        if (

            !tokenResponse.ok ||

            !tokenData.access_token

        ) {

            console.error(

                "Google token exchange failed:",

                tokenData

            );



            throw new Error(

                "Google authorization code exchange failed"

            );

        }



        const profileResponse =

            await fetch(

                "https://www.googleapis.com/oauth2/v2/userinfo",

                {

                    headers: {

                        Authorization:

                            `Bearer ${tokenData.access_token}`

                    }

                }

            );



        const googleProfile =

            await profileResponse.json();



        if (

            !profileResponse.ok ||

            !googleProfile.email

        ) {

            throw new Error(

                "Unable to retrieve Google account information"

            );

        }



        const googleId =

            googleProfile.id;



        const googleName =

            googleProfile.name ||

            googleProfile.email.split(

                "@"

            )[0];



        const googleEmail =

            googleProfile.email

                .toLowerCase()

                .trim();



        const googleImage =

            googleProfile.picture ||

            "";



        let user =

            await User.findOne({

                $or: [

                    { googleId },

                    {

                        email:

                            googleEmail

                    }

                ]

            });



        if (user) {

            user.googleId =

                googleId;



            if (

                !user.profileImage &&

                googleImage

            ) {

                user.profileImage =

                    googleImage;

            }



            await user.save();

        } else {

            const randomPassword =

                crypto.randomBytes(32)

                    .toString("hex");



            const hashedPassword =

                await bcrypt.hash(

                    randomPassword,

                    10

                );



            user =

                await User.create({

                    name: googleName,

                    email: googleEmail,

                    password:

                        hashedPassword,

                    googleId,

                    profileImage:

                        googleImage,

                    role: "student",

                    isVerified: true,

                    isActive: true

                });



            await StudentProfile.create({

                user:

                    user._id ||

                    user.id,

                college:

                    "College of Engineering",

                department:

                    "Computer Science",

                graduationYear: 2026,

                skills: [

                    "Software Development"

                ]

            });

        }



        if (user.isActive === false) {

            throw new Error(

                "Your ALEVATE account is currently inactive."

            );

        }



        const token =

            createToken(user);



        const frontendUser =

            safeUser(user);



        const redirectParams =

            new URLSearchParams({

                google_token:

                    token,

                google_user:

                    JSON.stringify(

                        frontendUser

                    )

            });



        return res.redirect(

            `${frontendUrl}/?${redirectParams.toString()}`

        );

    } catch (error) {

        console.error(

            "Google callback error:",

            error

        );



        const frontendUrl =

            getFrontendUrl();



        return res.redirect(

            `${frontendUrl}/?google_error=${encodeURIComponent(

                error.message ||

                "Google authentication failed"

            )}`

        );

    }

};



// ============================================================

// GITHUB LOGIN - START

// ============================================================



const githubAuth = async (

    req,

    res

) => {

    try {

        const clientId =

            process.env.GITHUB_CLIENT_ID;



        const callbackUrl =

            process.env.GITHUB_CALLBACK_URL ||

            "http://localhost:3000/api/auth/github/callback";



        if (!clientId) {

            return res.status(500).json({

                success: false,

                message:

                    "GITHUB_CLIENT_ID is not configured"

            });

        }



        const state =

            crypto.randomBytes(32)

                .toString("hex");



        setOAuthStateCookie(

            res,

            "github_oauth_state",

            state

        );



        const params =

            new URLSearchParams({

                client_id:

                    clientId,

                redirect_uri:

                    callbackUrl,

                scope:

                    "read:user user:email",

                state

            });



        return res.redirect(

            `https://github.com/login/oauth/authorize?${params.toString()}`

        );

    } catch (error) {

        console.error(

            "GitHub OAuth start error:",

            error

        );



        return res.status(500).json({

            success: false,

            message:

                "Unable to start GitHub Sign-In"

        });

    }

};



// ============================================================

// GITHUB LOGIN - CALLBACK

// ============================================================



const githubCallback = async (

    req,

    res

) => {

    try {

        const {

            code,

            state,

            error

        } = req.query;



        const frontendUrl =

            getFrontendUrl();



        if (error) {

            console.error(

                "GitHub OAuth error:",

                error

            );



            return res.redirect(

                `${frontendUrl}/?github_error=${encodeURIComponent(error)}`

            );

        }



        if (!code || !state) {

            return res.redirect(

                `${frontendUrl}/?github_error=missing_oauth_response`

            );

        }



        const storedState =

            getCookieValue(

                req,

                "github_oauth_state"

            );



        if (

            !storedState ||

            storedState !== state

        ) {

            console.error(

                "GitHub OAuth state mismatch"

            );



            return res.redirect(

                `${frontendUrl}/?github_error=invalid_oauth_state`

            );

        }



        clearOAuthStateCookie(

            res,

            "github_oauth_state"

        );



        const clientId =

            process.env.GITHUB_CLIENT_ID;



        const clientSecret =

            process.env.GITHUB_CLIENT_SECRET;



        const callbackUrl =

            process.env.GITHUB_CALLBACK_URL ||

            "http://localhost:3000/api/auth/github/callback";



        if (

            !clientId ||

            !clientSecret

        ) {

            throw new Error(

                "GitHub OAuth credentials are not configured"

            );

        }



        // --------------------------------------------------------

        // Exchange GitHub authorization code for access token

        // --------------------------------------------------------



        const tokenResponse =

            await fetch(

                "https://github.com/login/oauth/access_token",

                {

                    method: "POST",

                    headers: {

                        Accept:

                            "application/json",

                        "Content-Type":

                            "application/json"

                    },

                    body:

                        JSON.stringify({

                            client_id:

                                clientId,

                            client_secret:

                                clientSecret,

                            code,

                            redirect_uri:

                                callbackUrl

                        })

                }

            );



        const tokenData =

            await tokenResponse.json();



        if (

            !tokenResponse.ok ||

            !tokenData.access_token

        ) {

            console.error(

                "GitHub token exchange failed:",

                tokenData

            );



            throw new Error(

                "GitHub authorization code exchange failed"

            );

        }



        const githubAccessToken =

            tokenData.access_token;



        // --------------------------------------------------------

        // Get GitHub user profile

        // --------------------------------------------------------



        const githubHeaders = {

            Authorization:

                `Bearer ${githubAccessToken}`,

            Accept:

                "application/vnd.github+json",

            "X-GitHub-Api-Version":

                "2022-11-28"

        };



        const profileResponse =

            await fetch(

                "https://api.github.com/user",

                {

                    headers:

                        githubHeaders

                }

            );



        const githubProfile =

            await profileResponse.json();



        if (

            !profileResponse.ok ||

            !githubProfile.id

        ) {

            console.error(

                "GitHub profile request failed:",

                githubProfile

            );



            throw new Error(

                "Unable to retrieve GitHub account information"

            );

        }



        // --------------------------------------------------------

        // Get GitHub email addresses

        // --------------------------------------------------------



        const emailResponse =

            await fetch(

                "https://api.github.com/user/emails",

                {

                    headers:

                        githubHeaders

                }

            );



        const githubEmails =

            await emailResponse.json();



        if (

            !emailResponse.ok ||

            !Array.isArray(

                githubEmails

            )

        ) {

            console.error(

                "GitHub email request failed:",

                githubEmails

            );



            throw new Error(

                "Unable to retrieve GitHub email address"

            );

        }



        const primaryVerifiedEmail =

            githubEmails.find(

                (email) =>

                    email.primary ===

                        true &&

                    email.verified ===

                        true

            );



        const verifiedEmail =

            primaryVerifiedEmail ||

            githubEmails.find(

                (email) =>

                    email.verified ===

                    true

            );



        if (

            !verifiedEmail ||

            !verifiedEmail.email

        ) {

            throw new Error(

                "No verified GitHub email address is available"

            );

        }



        const githubId =

            String(

                githubProfile.id

            );



        const githubName =

            githubProfile.name ||

            githubProfile.login ||

            verifiedEmail.email.split(

                "@"

            )[0];



        const githubEmail =

            verifiedEmail.email

                .toLowerCase()

                .trim();



        const githubImage =

            githubProfile.avatar_url ||

            "";



        // --------------------------------------------------------

        // Find existing user

        // --------------------------------------------------------



        let user =

            await User.findOne({

                $or: [

                    { githubId },

                    {

                        email:

                            githubEmail

                    }

                ]

            });



        // --------------------------------------------------------

        // Existing user

        // --------------------------------------------------------



        if (user) {

            user.githubId =

                githubId;



            if (

                !user.profileImage &&

                githubImage

            ) {

                user.profileImage =

                    githubImage;

            }



            await user.save();

        }



        // --------------------------------------------------------

        // Create new GitHub user

        // --------------------------------------------------------



        else {

            const randomPassword =

                crypto.randomBytes(32)

                    .toString("hex");



            const hashedPassword =

                await bcrypt.hash(

                    randomPassword,

                    10

                );



            user =

                await User.create({

                    name: githubName,

                    email: githubEmail,

                    password:

                        hashedPassword,

                    githubId,

                    profileImage:

                        githubImage,

                    role: "student",

                    isVerified: true,

                    isActive: true

                });



            await StudentProfile.create({

                user:

                    user._id ||

                    user.id,

                college:

                    "College of Engineering",

                department:

                    "Computer Science",

                graduationYear: 2026,

                skills: [

                    "Software Development"

                ]

            });

        }



        if (user.isActive === false) {

            throw new Error(

                "Your ALEVATE account is currently inactive."

            );

        }



        // --------------------------------------------------------

        // Create ALEVATE JWT

        // --------------------------------------------------------



        const token =

            createToken(user);



        const frontendUser =

            safeUser(user);



        // --------------------------------------------------------

        // Redirect to React app

        // --------------------------------------------------------



        const redirectParams =

            new URLSearchParams({

                github_token:

                    token,

                github_user:

                    JSON.stringify(

                        frontendUser

                    )

            });



        return res.redirect(

            `${frontendUrl}/?${redirectParams.toString()}`

        );

    } catch (error) {

        console.error(

            "GitHub callback error:",

            error

        );



        const frontendUrl =

            process.env.FRONTEND_URL ||

            "http://localhost:3000";



        return res.redirect(

            `${frontendUrl}/?github_error=${encodeURIComponent(

                error.message ||

                "GitHub authentication failed"

            )}`

        );

    }

};



// ============================================================

// EXPORTS

// ============================================================



module.exports = {

    registerUser,

    loginUser,

    googleAuth,

    googleCallback,

    githubAuth,

    githubCallback

};