CREATE TABLE "invite" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "invite_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"code" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"max_uses" integer DEFAULT 1 NOT NULL,
	"created_by" text NOT NULL,
	"creation_date" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invite_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "invite_usage" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "invite_usage_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"invite_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"claim_date" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invite" ADD CONSTRAINT "invite_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_usage" ADD CONSTRAINT "invite_usage_invite_id_invite_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."invite"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_usage" ADD CONSTRAINT "invite_usage_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;