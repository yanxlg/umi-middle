import styled from 'styled-components';
import bgSvg from './assets/bg.svg';

const Container = styled.div`
  position: absolute;
  top: 50%;
  left: 100%;
  z-index: 100;
  width: 10px;
  height: 52px;
  transform: translateY(-50%);
  color: rgba(176, 176, 176, 1);
  text-align: center;
  background: url('${bgSvg}') no-repeat center;
  background-size: cover;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #5480f6;

    svg {
      transform: scale(-1);
    }
  }
`;

const CollapsedButton = ({
  collapsed,
  onCollapse,
}: {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}) => {
  return (
    <Container
      onClick={() => {
        onCollapse(!collapsed);
      }}
    >
      {collapsed ? (
        <svg width="5px" height="13px" viewBox="0 0 5 13" fill="currentColor">
          <g stroke="none" strokeWidth="1" fillRule="evenodd">
            <g transform="translate(-160.000000, -1195.000000)">
              <g transform="translate(162.000000, 1201.000000) scale(-1, 1) translate(-162.000000, -1201.000000) translate(157.000000, 1175.000000)">
                <g transform="translate(4.799993, 26.200047) scale(-1, 1) translate(-4.799993, -26.200047) translate(2.599987, 20.000000)">
                  <path d="M3.22553046,0.320443604 C3.39922196,0.0147045581 3.78637718,-0.0917949703 4.087333,0.0866479116 C4.38594771,0.263702703 4.48861845,0.652994238 4.31668156,0.955643697 L4.31668156,0.955643697 L1.35293386,6.20005081 L4.31698154,11.4456217 C4.47011873,11.7185476 4.40296295,12.0605492 4.17012024,12.2554036 L4.17012024,12.2554036 L4.08644435,12.3146086 C3.78530239,12.491069 3.39887418,12.3854159 3.22528519,12.0798561 L3.22528519,12.0798561 L0.0638024576,6.48276298 L0.0236438006,6.37168146 L0.00696883743,6.29356927 L7.99739351e-13,6.2142546 L0.00329561071,6.13600823 C0.0083714705,6.09293451 0.0294694246,6.02066938 0.066589473,5.91921285 L0.066589473,5.91921285 L0.0886620786,5.87130334 Z"></path>
                </g>
              </g>
            </g>
          </g>
        </svg>
      ) : (
        <svg
          width="5px"
          height="13px"
          viewBox="0 0 5 13"
          version="1.1"
          fill="currentColor"
        >
          <g stroke="none" strokeWidth="1" fillRule="evenodd">
            <g transform="translate(-194.000000, -1195.000000)">
              <g transform="translate(196.000000, 1201.000000) scale(-1, 1) translate(-196.000000, -1201.000000) translate(191.000000, 1175.000000)">
                <g transform="translate(4.799993, 26.200047) scale(-1, 1) translate(-4.799993, -26.200047) translate(2.599987, 20.000000)">
                  <path
                    d="M3.22553046,0.320443604 C3.39922196,0.0147045581 3.78637718,-0.0917949703 4.087333,0.0866479116 C4.38594771,0.263702703 4.48861845,0.652994238 4.31668156,0.955643697 L4.31668156,0.955643697 L1.35293386,6.20005081 L4.31698154,11.4456217 C4.47011873,11.7185476 4.40296295,12.0605492 4.17012024,12.2554036 L4.17012024,12.2554036 L4.08644435,12.3146086 C3.78530239,12.491069 3.39887418,12.3854159 3.22528519,12.0798561 L3.22528519,12.0798561 L0.0638024576,6.48276298 L0.0236438006,6.37168146 L0.00696883743,6.29356927 L3.50321071e-13,6.2142546 L0.00329561071,6.13600823 C0.00837147049,6.09293451 0.0294694246,6.02066938 0.066589473,5.91921285 L0.066589473,5.91921285 L0.0886620786,5.87130334 Z"
                    transform="translate(2.200007, 6.200047) scale(-1, 1) translate(-2.200007, -6.200047) "
                  ></path>
                </g>
              </g>
            </g>
          </g>
        </svg>
      )}
    </Container>
  );
};

export default CollapsedButton;
