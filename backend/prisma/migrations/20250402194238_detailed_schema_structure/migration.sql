-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('CAMERA_BODY', 'LENS', 'FLASH', 'MOTOR', 'ACCESSORY');

-- CreateEnum
CREATE TYPE "SpecValueType" AS ENUM ('STRING', 'INT', 'FLOAT', 'BOOLEAN', 'ENUM_LIST');

-- CreateTable
CREATE TABLE "Brand" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "countryOfOrigin" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mount" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" SERIAL NOT NULL,
    "brandId" INTEGER NOT NULL,
    "baseModelName" TEXT NOT NULL,
    "versionIdentifier" TEXT,
    "productionStartYear" INTEGER,
    "productionEndYear" INTEGER,
    "equipmentType" "EquipmentType" NOT NULL,
    "mainImageUrl" TEXT,
    "description" TEXT,
    "mountId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecificationDefinition" (
    "id" SERIAL NOT NULL,
    "specKey" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "unit" TEXT,
    "valueType" "SpecValueType" NOT NULL,
    "applicableTo" "EquipmentType"[],
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecificationDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecificationValue" (
    "id" SERIAL NOT NULL,
    "equipmentId" INTEGER NOT NULL,
    "specDefinitionId" INTEGER NOT NULL,
    "stringValue" TEXT,
    "intValue" INTEGER,
    "floatValue" DOUBLE PRECISION,
    "booleanValue" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecificationValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EquipmentTags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EquipmentTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Mount_name_key" ON "Mount"("name");

-- CreateIndex
CREATE INDEX "Equipment_brandId_idx" ON "Equipment"("brandId");

-- CreateIndex
CREATE INDEX "Equipment_mountId_idx" ON "Equipment"("mountId");

-- CreateIndex
CREATE INDEX "Equipment_equipmentType_idx" ON "Equipment"("equipmentType");

-- CreateIndex
CREATE UNIQUE INDEX "SpecificationDefinition_specKey_key" ON "SpecificationDefinition"("specKey");

-- CreateIndex
CREATE INDEX "SpecificationValue_equipmentId_idx" ON "SpecificationValue"("equipmentId");

-- CreateIndex
CREATE INDEX "SpecificationValue_specDefinitionId_idx" ON "SpecificationValue"("specDefinitionId");

-- CreateIndex
CREATE UNIQUE INDEX "SpecificationValue_equipmentId_specDefinitionId_key" ON "SpecificationValue"("equipmentId", "specDefinitionId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "_EquipmentTags_B_index" ON "_EquipmentTags"("B");

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_mountId_fkey" FOREIGN KEY ("mountId") REFERENCES "Mount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecificationValue" ADD CONSTRAINT "SpecificationValue_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecificationValue" ADD CONSTRAINT "SpecificationValue_specDefinitionId_fkey" FOREIGN KEY ("specDefinitionId") REFERENCES "SpecificationDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EquipmentTags" ADD CONSTRAINT "_EquipmentTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EquipmentTags" ADD CONSTRAINT "_EquipmentTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
