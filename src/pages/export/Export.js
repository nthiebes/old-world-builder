import { useEffect, Fragment } from "react";
import { useParams, useLocation } from "react-router-dom";

import { Header, Main } from "../../components/page";
import { Button } from "../../components/button";

export const Export = ({ isMobile }) => {
  const MainComponent = isMobile ? Main : Fragment;
  const { listId } = useParams();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      {isMobile && (
        <Header to={`/editor/${listId}`} headline="Liste exportieren" />
      )}

      <MainComponent>
        {!isMobile && (
          <Header
            isSection
            to={`/editor/${listId}`}
            headline="Liste exportieren"
          />
        )}
        <ul>
          <li>
            <Button>Als Text exportieren</Button>
          </li>
        </ul>
      </MainComponent>
    </>
  );
};
