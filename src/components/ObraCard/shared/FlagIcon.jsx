import { useLanguage } from '../../../i18n/LanguageContext';

const TIPO_TITLE_KEY = {
  'Coreano': 'tipo_title_coreano',
  'Chinês':  'tipo_title_chines',
  'Japonês': 'tipo_title_japones',
};

function FlagIcon({ tipo, size = 20 }) {
  const { t } = useLanguage();
  const getTitle = () => t(TIPO_TITLE_KEY[tipo]) || tipo;

  switch (tipo) {
    case 'Coreano':
      // South Korea flag - from Wikipedia
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size * 0.667}
          viewBox="-72 -48 144 96"
          title={getTitle()}
          style={{ display: 'block', borderRadius: '2px' }}
        >
          <path fill="#fff" d="M-72-48v96H72v-96z"/>
          <g stroke="#000" strokeWidth="4">
            <path transform="rotate(33.69006752598)" d="M-50-12v24m6 0v-24m6 0v24m76 0V1m0-2v-11m6 0v11m0 2v11m6 0V1m0-2v-11"/>
            <path transform="rotate(-33.69006752598)" d="M-50-12v24m6 0V1m0-2v-11m6 0v24m76 0V1m0-2v-11m6 0v24m6 0V1m0-2v-11"/>
          </g>
          <g transform="rotate(33.69006752598)">
            <path fill="#cd2e3a" d="M12 0a18 18 0 11-36 0 24 24 0 1148 0"/>
            <path fill="#0047a0" d="M0 0a12 12 0 1124 0 24 24 0 11-48 0 12 12 0 1024 0"/>
          </g>
        </svg>
      );
    case 'Chinês':
      // China flag - from Wikipedia
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size * 0.667}
          viewBox="0 0 30 20"
          title={getTitle()}
          style={{ display: 'block', borderRadius: '2px' }}
        >
          <defs>
            <path
              id="s"
              d="M0,-1 0.587785,0.809017 -0.951057,-0.309017H0.951057L-0.587785,0.809017z"
              fill="#ffde00"
            />
          </defs>
          <rect width="30" height="20" fill="#ef2800"/>
          <g transform="matrix(0.00199993,0,0,0.00199838,-9.6791099e-5,0.00628569)" fill="#e0ff01">
            <g>
              <g>
                <path d="m 4623.2,671.7 187,311.5 -238.6,274.1 354.1,-81.5 186.9,311.5 32,-361.9 354,-81.5 -334.3,-142.1 31.8,-362 -238.5,274.1 z"/>
                <path d="M 2500.2,1000 2163.7,2036.5 H 1073.5 l 881.8,640.7 -336.7,1036.3 881.9,-640.4 881.6,640.3 -336.8,-1036.1 881.6,-641 -1090,0.3 z"/>
                <path d="m 5780.4,1551.2 51.5,359.5 -326.2,160 357.9,62.3 51.4,359.5 169.9,-321.1 357.8,62.2 -253,-260.6 169.7,-321.2 -326.1,160.1 z"/>
                <path d="m 5176.9,4032.2 -226.9,283.7 -340,-128.2 199.6,303.5 -226.9,283.6 350.3,-96 199.6,303.3 16.8,-362.7 350.3,-96.2 -339.7,-128.1 z"/>
                <path d="m 5982.6,3000.3 -99.7,349.3 -363.2,13 301.4,202.9 -99.8,349.2 286.1,-223.9 301.3,202.7 -124.6,-341.1 286,-224.1 -363.1,13.1 z"/>
              </g>
            </g>
          </g>
        </svg>
      );
    case 'Japonês':
      // Japan flag - from Wikipedia
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size * 0.667}
          viewBox="0 0 900 600"
          title={getTitle()}
          style={{ display: 'block', borderRadius: '2px' }}
        >
          <rect fill="#fff" height="600" width="900"/>
          <circle fill="#bc002d" cx="450" cy="300" r="180"/>
        </svg>
      );
    default:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size * 0.667}
          viewBox="0 0 900 600"
          title={tipo}
          style={{ display: 'block', borderRadius: '2px' }}
        >
          <rect fill="#ccc" width="900" height="600"/>
        </svg>
      );
  }
}

export default FlagIcon;
