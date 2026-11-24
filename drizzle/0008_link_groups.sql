CREATE TABLE "group_members" (
	"group_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "group_members_group_id_user_id_pk" PRIMARY KEY("group_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "groups_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"owner_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "group_id" integer;--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "created_by" text;--> statement-breakpoint
-- backfill: a personal group for every user with access or with links, owner as its only member
INSERT INTO "groups" ("name", "owner_id", "created_at")
SELECT u."name", u."id", u."created_at" FROM "user" u
WHERE u."role" IN ('user', 'admin') OR EXISTS (SELECT 1 FROM "links" l WHERE l."owner" = u."id")
ORDER BY u."created_at";--> statement-breakpoint
INSERT INTO "group_members" ("group_id", "user_id", "joined_at")
SELECT g."id", g."owner_id", g."created_at" FROM "groups" g;--> statement-breakpoint
UPDATE "links" SET "group_id" = g."id", "created_by" = "links"."owner" FROM "groups" g WHERE g."owner_id" = "links"."owner";--> statement-breakpoint
ALTER TABLE "links" ALTER COLUMN "group_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "links_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "links_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "links" DROP CONSTRAINT "links_owner_user_id_fk";--> statement-breakpoint
ALTER TABLE "links" DROP COLUMN "owner";
