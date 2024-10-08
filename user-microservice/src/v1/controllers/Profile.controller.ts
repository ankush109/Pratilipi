import { PrismaClient } from "@prisma/client";
import { type NextFunction, type Request, type Response } from "express";
import createError from "http-errors";

import { customResponse } from "../utils/Response.util";
import { ZodError } from "zod";
import { publishEvent } from "../../app";
const prisma = new PrismaClient();

export const ProfileController = {
  async createMyprofile(req: any, res: Response, next: NextFunction) {
    try {
      const userId: any = req.user.id;
      const { bio, shippingAddress, phoneNumber, pincode, city, country } =
        req.body;
      console.log(userId, "userid");
      const profile = await prisma.profile.create({
        data: {
          userId: userId,
          bio: bio,
          shippingAddress: shippingAddress,
          city: city,
          country: country,
          pincode: pincode,
          phoneNumber: phoneNumber,
        },
      });
      console.log(profile, "user profile...");
      res
        .status(201)
        .json(customResponse(201, "profile created successfully!!"));
    } catch (err) {
      console.log(err, "erre");
      if (err instanceof ZodError) {
        return next({
          status: createError.InternalServerError().status,
          message: err.issues,
        });
      }
      return next(createError.InternalServerError());
    }
  },
  async getMyProfile(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const profile = await prisma.profile.findFirstOrThrow({
        where: {
          userId: userId,
        },
      });
      res.status(201).json(customResponse(201, profile));
    } catch (err) {
      if (err instanceof ZodError) {
        return next({
          status: createError.InternalServerError().status,
          message: err.issues,
        });
      }
      return next(createError.InternalServerError());
    }
  },
  async updateMyProfile(req: any, res: Response, next: NextFunction) {
    try {
      const userId: any = req.user.id;
      const { bio, shippingAddress, phoneNumber, pincode, city, country } =
        req.body;
      console.log(userId, "userid");
      const profile = await prisma.profile.update({
        where: {
          userId: userId,
        },
        data: {
          userId: userId,
          bio: bio,
          shippingAddress: shippingAddress,
          city: city,
          country: country,
          pincode: pincode,
          phoneNumber: phoneNumber,
        },
        select: {
          user: true,
          phoneNumber: true,
          pincode: true,
          shippingAddress: true,
          city: true,
          country: true,
        },
      });
      const message = {
        name: profile.user.name,
        userId: profile.user.id,
        email: profile.user.email,
        phoneNumber: profile.phoneNumber,
        city: profile.city,
        shippingAddress: profile.shippingAddress,
        country: profile.country,
      };
      await publishEvent(message, "user_profile_updated");
      res
        .status(201)
        .json(customResponse(201, "profile updated successfully!!"));
    } catch (err) {
      if (err instanceof ZodError) {
        return next({
          status: createError.InternalServerError().status,
          message: err.issues,
        });
      }
      return next(createError.InternalServerError());
    }
  },
  async getUserDetails(req: any, res: Response, next: NextFunction) {
    try {
      const userId: any = req.user.id;
      const userDetails = await prisma.user.findFirstOrThrow({
        where: {
          id: userId,
        },
        include: {
          profile: true,
        },
      });

      res.status(201).json(customResponse(201, userDetails));
    } catch (err) {
      if (err instanceof ZodError) {
        return next({
          status: createError.InternalServerError().status,
          message: err.issues,
        });
      }
      return next(createError.InternalServerError());
    }
  },
  async getUserById(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userDetails = await prisma.user.findFirstOrThrow({
        where: {
          id: id,
        },
        include: {
          profile: true,
        },
      });

      res.status(201).json(customResponse(201, userDetails));
    } catch (err) {
      if (err instanceof ZodError) {
        return next({
          status: createError.InternalServerError().status,
          message: err.issues,
        });
      }
      return next(createError.InternalServerError());
    }
  },
};
