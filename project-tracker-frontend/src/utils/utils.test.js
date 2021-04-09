import {
    extractQuantifyInfoXlsx,
    XLSX_SAMPLE_NAME,
    XLSX_CORRECTED_INVESTIGATOR_ID,
    sortSamples,
    getSortedRequests
} from "./utils";
import {CORRECTED_INVESTIGATOR_ID, CORRECTED_SAMPLE, MOCK_SAMPLES, UNCORRECTED_SAMPLE} from "../mocks/samples";
import {REQ_deliveryDate, REQ_dueDate} from "./api-util";

test('Sample Information is correctly parsed', () => {
    const qtyInfo = extractQuantifyInfoXlsx(MOCK_SAMPLES);

    expect(qtyInfo.length).toBe(2);

    const corrected_sample = qtyInfo.filter(s => s[XLSX_SAMPLE_NAME] === CORRECTED_SAMPLE);
    const uncorrected_sample = qtyInfo.filter(s => s[XLSX_SAMPLE_NAME] === UNCORRECTED_SAMPLE);

    expect(corrected_sample.length).toBe(1);
    expect(uncorrected_sample.length).toBe(1);

    expect(corrected_sample[0][XLSX_CORRECTED_INVESTIGATOR_ID]).toBe(CORRECTED_INVESTIGATOR_ID);
    expect(uncorrected_sample[0][XLSX_CORRECTED_INVESTIGATOR_ID]).toBe('');
});

test('Samples are sorted correctly on recordName', () => {
    const sn = { 'root': {}};
    const s1 = { 'root': {'recordName': '08470_E_1'}};
    const s2 = { 'root': {'recordName': '08470_E_4'}};
    const s3 = { 'root': {'recordName': '08470_E_11'}};
    const s4 = { 'root': {'recordName': '08470_E_42'}};

    expect(sortSamples(sn, s1)).toBe(1);

    expect(sortSamples(s1, s2)).toBe(-1);
    expect(sortSamples(s1, s3)).toBe(-1);
    expect(sortSamples(s1, s4)).toBe(-1);
    expect(sortSamples(s1, s1)).toBe(0);
    expect(sortSamples(s2, s1)).toBe(1);
    expect(sortSamples(s3, s1)).toBe(1);
    expect(sortSamples(s4, s1)).toBe(1);

    expect(sortSamples(s2, s3)).toBe(-1);
    expect(sortSamples(s2, s4)).toBe(-1);
    expect(sortSamples(s2, s2)).toBe(0);
    expect(sortSamples(s3, s2)).toBe(1);
    expect(sortSamples(s4, s2)).toBe(1);

    expect(sortSamples(s3, s4)).toBe(-1);
    expect(sortSamples(s3, s3)).toBe(0);
    expect(sortSamples(s4, s3)).toBe(1);
});

test('requests are date-sorted correctly ', () => {
    const r1 = { id: 'r1', REQ_dueDate: 1, REQ_deliveryDate: 4 };
    const r2 = { id: 'r2', REQ_dueDate: 2, REQ_deliveryDate: 3 };
    const r3 = { id: 'r3', REQ_dueDate: 3, REQ_deliveryDate: 2 };
    const r4 = { id: 'r4', REQ_dueDate: 4, REQ_deliveryDate: 1 };

    const original = [r1, r2, r3, r4];
    const reversed = [r1, r2, r3, r4];

    expect(getSortedRequests([...original], false, REQ_dueDate)).toStrictEqual(original);
    expect(getSortedRequests([...original], true, REQ_dueDate)).toStrictEqual(reversed);
    expect(getSortedRequests([...original], false, REQ_deliveryDate)).toStrictEqual(reversed);
    expect(getSortedRequests([...original], true, REQ_deliveryDate)).toStrictEqual(original);
});
