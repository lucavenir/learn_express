import { BadRequestError } from "../errors";
import FollowDb from "../db/models/follow";
import { Follow, FollowUnfollowParams } from "./models/follow-model";

export default class FollowService {
   public async followUser(params: FollowUnfollowParams): Promise<Follow> {
      const followerId = params.followerId;
      const followingId = params.followingId;
      if (followerId === followingId) throw new BadRequestError("You can't follow yourself");

      const isFollowing = await FollowDb.findOne({
         followerId: followerId,
         followingId: followingId,
      });
      if (isFollowing) throw new BadRequestError("You're already following this user");

      const follow = await FollowDb.create({
         followerId: followerId,
         followingId: followingId,
      });

      return follow.toJSON();
   }
}
