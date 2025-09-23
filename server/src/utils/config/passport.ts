import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import dotenv from "dotenv";
import { UserRepository } from "@/apis/user/UserRepository";
import axios from 'axios';
import AuthSocialMediaService from '@/apis/auth/authSocialMedia/authsocialmedia.service';
import { User } from "@/apis/user/interfaces/user.interfaces";
import HttpException from "../exceptions/http.exception";

dotenv.config();

const userRepository = new UserRepository();
const userService = new AuthSocialMediaService();

passport.use(
    new MicrosoftStrategy(
        {
            clientID: process.env.MICROSOFT_CLIENT_ID!,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
            callbackURL: process.env.MICROSOFT_REDIRECT_URI!,
            scope: ['user.read'],
        },
        async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: User | null) => void) => {
            try {
                let user = await userRepository.findByEmail(profile.emails[0].value);
                if (!user) {
                    user = await userService.createUser(profile);
                    return done(null, user);
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        },
    ),
);


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_REDIRECT_URI!, // ex: http://localhost:4000/api/v1/auth/google/callback
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new HttpException(406, 'No email found from Google account'));
        }

        let user = await userRepository.findByEmail(email);
        if (!user) {
          user = await userService.createUser({
            emails: [{ value: email }],
            name: {
              givenName: profile.name?.givenName || '',
              familyName: profile.name?.familyName || '',
            },
            profilePicture: profile.photos?.[0]?.value || null,
            provider: 'google',
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      callbackURL: process.env.LINKEDIN_REDIRECT_URI!,
      scope: ['w_member_social', 'openid', 'profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        let user = await userRepository.findByEmail(email);
        if (!user) {
          user = await userService.createUser({
            emails: [{ value: email }],
            name: {
              givenName: profile.name?.givenName || '',
              familyName: profile.name?.familyName || '',
            },
            profilePicture: profile._json.picture || null,
            provider: 'linkedin',
          });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

(LinkedInStrategy as any).prototype.userProfile = async function (
  accessToken: string,
  done: (error: any, profile?: any) => void
) {
  try {
    const response = await axios.get(process.env.LINKEDIN_USERINFO_URL!, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const json = response.data;
    const profile = {
      provider: "linkedin",
      id: json.sub,
      displayName: json.name || `${json.given_name} ${json.family_name}`,
      name: {
        givenName: json.given_name,
        familyName: json.family_name,
      },
      emails: [{ value: json.email }],
      profilePicture: json.picture,
      country: json.locale?.country,
      _raw: JSON.stringify(json),
      _json: json,
    };
    done(null, profile);
  } catch (error) {
    done(error);
  }
};

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userRepository.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
