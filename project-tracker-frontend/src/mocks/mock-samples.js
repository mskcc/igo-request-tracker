export const UNCORRECTED_SAMPLE_NAME = 'UNCORRECTED_SAMPLE';
export const CORRECTED_SAMPLE_NAME = 'CORRECTED_SAMPLE';
export const CORRECTED_INVESTIGATOR_ID = 'CORRECTED_INVESTIGATOR_ID';
export const INVESTIGATOR_ID = 'INVESTIGATOR_ID';

export const TEST_SAMPLE_CORRECTED = {
    'sampleId': 5822187,
    'stages': [
        {
            'stage': 'Library Capture',
            'startTime': 1567626102863,
            'updateTime': 1571156058149,
            'complete': true
        },
        {
            'stage': 'Sequencing',
            'startTime': 1570199181890,
            'updateTime': 1571926460130,
            'complete': true
        }
    ],
    'sampleInfo': {
        'sampleName': CORRECTED_SAMPLE_NAME,
        'correctedInvestigatorId': CORRECTED_INVESTIGATOR_ID,
        'investigatorId': INVESTIGATOR_ID,
        'library_material': {
            'volume': 8,
            'mass': 400,
            'concentration': 50,
            'concentrationUnits': 'ng/uL'
        },
        'dna_material': {
            'volume': 0,
            'mass': 0,
            'concentration': 0,
            'concentrationUnits': ''
        }
    },
    'status': 'Complete'
};

export const TEST_SAMPLE_UNCORRECTED = {
    'sampleId': 5822192,
    'stages': [
        {
            'stage': 'Library Capture',
            'startTime': 1567626103351,
            'updateTime': 1571156058149,
            'complete': true
        },
        {
            'stage': 'Sequencing',
            'startTime': 1570199181917,
            'updateTime': 1571926460130,
            'complete': true
        }
    ],
    'sampleInfo': {
        'sampleName': UNCORRECTED_SAMPLE_NAME,
        'correctedInvestigatorId': '',
        'investigatorId': INVESTIGATOR_ID,
        'library_material': {
            'volume': 5.882352941176471,
            'mass': 250.00000000000003,
            'concentration': 42.5,
            'concentrationUnits': 'ng/uL'
        },
        'dna_material': {
            'volume': 0,
            'mass': 0,
            'concentration': 0,
            'concentrationUnits': ''
        }
    },
    'status': 'Complete'
}

export const MOCK_SAMPLES = [
    TEST_SAMPLE_CORRECTED,
    TEST_SAMPLE_UNCORRECTED
];
