-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
