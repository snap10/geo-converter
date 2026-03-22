import { setActivePinia, createPinia } from "pinia"
import { describe, it, expect, beforeEach } from "vitest"
import { useGeojsonStore } from "../geojson"
import { useIsoXmlStore } from "../isoxml"
import * as fs from "fs"
import * as path from "path"

describe("useIsoXmlStore - Round Trip", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it("should preserve Customer and Farm IDs when round-tripping ISOXML", async () => {
    const geojsonStore = useGeojsonStore()
    const isoxmlStore = useIsoXmlStore()
    
    const testIsoXml = `<?xml version="1.0" encoding="UTF-8"?>
<ISO11783_TaskData VersionMajor="4" VersionMinor="3" ManagementSoftwareManufacturer="FMIS" ManagementSoftwareVersion="1.0" DataTransferOrigin="1">
  <CTR A="CTR1" B="Birk"></CTR>
  <CTR A="CTR2" B="Hess"></CTR>
  <FRM A="FRM1" B="Farm1"></FRM>
  <FRM A="FRM2" B="Farm2"></FRM>
  <PFD F="FRM2" E="CTR2" D="9770" C="Field1" B="CODE1" A="PFD-1">
    <PLN A="1">
      <LSG A="1">
        <PNT D="9.842" C="48.149" A="2"></PNT>
        <PNT D="9.843" C="48.150" A="2"></PNT>
        <PNT D="9.843" C="48.149" A="2"></PNT>
        <PNT D="9.842" C="48.149" A="2"></PNT>
      </LSG>
    </PLN>
  </PFD>
  <PFD A="PFD-2" C="Field2" B="CODE2" D="8974" F="FRM1" E="CTR1">
    <PLN A="1">
      <LSG A="1">
        <PNT A="2" C="48.138" D="9.836"></PNT>
        <PNT A="2" C="48.139" D="9.837"></PNT>
        <PNT A="2" C="48.139" D="9.836"></PNT>
        <PNT A="2" C="48.138" D="9.836"></PNT>
      </LSG>
    </PLN>
  </PFD>
</ISO11783_TaskData>`

    await isoxmlStore.parseAsGeoJson(testIsoXml, "application/xml")
    
    expect(geojsonStore.geojson.features).toHaveLength(2)
    
    const feature1 = geojsonStore.geojson.features[0]
    expect(feature1.properties.customerId).toBe("CTR2")
    expect(feature1.properties.farmId).toBe("FRM2")
    
    const feature2 = geojsonStore.geojson.features[1]
    expect(feature2.properties.customerId).toBe("CTR1")
    expect(feature2.properties.farmId).toBe("FRM1")
    
    const exportedXml = await isoxmlStore.createIsoXml()
    const exportedStr = new TextDecoder().decode(exportedXml)
    
    expect(exportedStr).toContain("CTR1")
    expect(exportedStr).toContain("CTR2")
    expect(exportedStr).toContain("FRM1")
    expect(exportedStr).toContain("FRM2")
  })

  it("should preserve feature to Customer/Farm relationships", async () => {
    const geojsonStore = useGeojsonStore()
    const isoxmlStore = useIsoXmlStore()
    
    const testIsoXml = `<?xml version="1.0" encoding="UTF-8"?>
<ISO11783_TaskData VersionMajor="4" VersionMinor="3" ManagementSoftwareManufacturer="FMIS" ManagementSoftwareVersion="1.0" DataTransferOrigin="1">
  <CTR A="CTR1" B="Birk"></CTR>
  <FRM A="FRM1" B="Farm1"></FRM>
  <PFD A="PFD-1" C="Field1" B="CODE1" D="5000" F="FRM1" E="CTR1">
    <PLN A="1">
      <LSG A="1">
        <PNT A="2" C="48.0" D="9.0"></PNT>
        <PNT A="2" C="48.1" D="9.1"></PNT>
        <PNT A="2" C="48.0" D="9.0"></PNT>
      </LSG>
    </PLN>
  </PFD>
</ISO11783_TaskData>`

    await isoxmlStore.parseAsGeoJson(testIsoXml, "application/xml")
    
    const feature = geojsonStore.geojson.features[0]
    expect(feature.properties.customerId).toBe("CTR1")
    expect(feature.properties.farmId).toBe("FRM1")
    
    const exportedXml = await isoxmlStore.createIsoXml()
    const exportedStr = new TextDecoder().decode(exportedXml)
    
    expect(exportedStr).toContain('E="CTR1"')
    expect(exportedStr).toContain('F="FRM1"')
    
    const pfdMatch = exportedStr.match(/<PFD[^>]*>/)
    expect(pfdMatch).not.toBeNull()
    expect(pfdMatch![0]).toContain("E=\"CTR1\"")
    expect(pfdMatch![0]).toContain("F=\"FRM1\"")
  })

  it("should parse fixture TASKDATA.XML file correctly", async () => {
    const geojsonStore = useGeojsonStore()
    const isoxmlStore = useIsoXmlStore()
    
    const xmlPath = path.join(__dirname, "../../test/fixtures/TASKDATA.XML")
    const testIsoXml = fs.readFileSync(xmlPath, "utf-8")
    
    await isoxmlStore.parseAsGeoJson(testIsoXml, "application/xml")
    
    expect(geojsonStore.geojson.features.length).toBeGreaterThan(0)
    
    const firstFeature = geojsonStore.geojson.features[0]
    expect(firstFeature.properties.partfieldDesignator).toBeDefined()
    expect(firstFeature.properties.partfieldArea).toBeDefined()
    expect(firstFeature.properties.customerId).toBeDefined()
    expect(firstFeature.properties.farmId).toBeDefined()
    
    const exportedXml = await isoxmlStore.createIsoXml()
    const exportedStr = new TextDecoder().decode(exportedXml)
    
    expect(exportedStr).toContain("<CTR")
    expect(exportedStr).toContain("<FRM")
    expect(exportedStr).toContain("<PFD")
    expect(exportedStr).toContain("E=\"")
    expect(exportedStr).toContain("F=\"")
  })
})
