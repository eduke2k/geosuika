import { DialogJSON } from '../scenes/DialogScene';

export const testDialog: DialogJSON = {
  greet1: [
    {
      side: 'left',
      text: [
        'Greet 1 Line 1 Line 1 Line 1 Line 1 Line 1 Line 1 Line 1',
        'Greet 1 Line 2 Line 2',
      ]
    },
    {
      side: 'right',
      text: [
        'Greet1 asdasdasdasd',
        'Greet 1sdasdasdasasdad',
      ],
      end: true
    }
  ],
  greet2: [
    {
      side: 'left',
      text: [
        'Greet 2 Line 1 Line 1 Line 1 Line 1 Line 1 Line 1 Line 1',
        'Greet 2 Line 2 Line 2',
      ]
    },
    {
      side: 'right',
      text: [
        'Greet 2 asdasdasdasd',
        'Greet 2 sdasdasdasasdad',
      ],
      end: true
    }
  ]
}