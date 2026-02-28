import asyncio
from prisma import Prisma
from app.utils.security import get_password_hash

USERS = [
    {
        "email": "admin@gram.in",
        "password": "password123",
        "role": "admin",
        "full_name": "Admin User",
        "mobile": "9000000001",
    },
    {
        "email": "clerk@gram.in",
        "password": "password123",
        "role": "clerk",
        "full_name": "Clerk User",
        "mobile": "9000000002",
    },
    {
        "email": "citizen@gram.in",
        "password": "password123",
        "role": "citizen",
        "full_name": "Citizen User",
        "mobile": "9000000003",
    },
]

async def main():
    db = Prisma()
    await db.connect()

    for u in USERS:
        existing = await db.user.find_unique(where={"email": u["email"]})
        if existing:
            print(f"⚠️  Already exists: {u['email']}  (skipped)")
        else:
            hashed_pwd = get_password_hash(u["password"])
            await db.user.create(
                data={
                    "email": u["email"],
                    "password_hash": hashed_pwd,
                    "role": u["role"],
                    "full_name": u["full_name"],
                    "mobile": u["mobile"],
                    "is_active": True,
                }
            )
            print(f"✅ Created: {u['email']}  |  role: {u['role']}  |  password: {u['password']}")

    await db.disconnect()
    print("\n🎉 Seeding complete!")

if __name__ == "__main__":
    asyncio.run(main())
