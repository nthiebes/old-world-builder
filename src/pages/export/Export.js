import { useEffect, Fragment, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import { Helmet } from "react-helmet-async";

import { Header, Main } from "../../components/page";
import { Button } from "../../components/button";
import { Expandable } from "../../components/expandable";
import { useLanguage } from "../../utils/useLanguage";

import { getListAsText } from "./get-list-as-text";
// import { getListAsMarkdown } from "./get-list-as-markdown";
import "./Export.css";

const getFile = ({ list, listText, asText }) => {
  const fileName = `${list?.name
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/,/g, "")}.${asText ? "txt" : "owb.json"}`;
  const file = new File([asText ? listText : JSON.stringify(list)], fileName, {
    type: asText ? "text/plain" : "application/json",
  });
  const fileUrl = URL.createObjectURL(file);

  return {
    file,
    fileUrl,
    fileName,
  };
};

export const Export = ({ isMobile }) => {
  const MainComponent = isMobile ? Main : Fragment;
  const intl = useIntl();
  const location = useLocation();
  const { language } = useLanguage();
  const { listId } = useParams();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [shareError, setShareError] = useState(false);
  const [shareOwbError, setOwbShareError] = useState(false);
  const [isShowList, setIsShowList] = useState(false);
  const [isCompactList, setIsCompactList] = useState(false);
  const [showSpecialRules, setShowSpecialRules] = useState(false);
  // const [isMarkdownList, setIsMarkdownList] = useState(false);
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );
  const listText = list
    ? getListAsText({
        list,
        isShowList,
        isCompactList,
        showSpecialRules,
        intl,
        language,
      })
    : "";
  const copyText = () => {
    navigator.clipboard &&
      navigator.clipboard.writeText(listText).then(
        () => {
          setCopied(true);
        },
        () => {
          setCopyError(true);
        }
      );
  };
  const { file, fileUrl, fileName } = getFile({ list });
  const { fileName: textFileName, fileUrl: textFileUrl } = getFile({
    list,
    listText,
    asText: true,
  });
  const share = async ({ asText }) => {
    const shareData = {};

    asText ? setShareError(false) : setOwbShareError(false);

    if (asText) {
      shareData.text = listText;
    } else {
      shareData.title = list.name;
      shareData.files = [file];
      shareData.text = list.description;
    }

    if (!navigator.canShare) {
      asText ? setShareError(true) : setOwbShareError(true);
      return;
    }

    try {
      await navigator.share(shareData);
    } catch (error) {
      asText ? setShareError(true) : setOwbShareError(true);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (!list) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{`Old World Builder | ${list?.name}`}</title>
      </Helmet>

      {isMobile && (
        <Header
          to={`/editor/${listId}`}
          headline={intl.formatMessage({
            id: "export.title",
          })}
        />
      )}

      <MainComponent>
        {!isMobile && (
          <Header
            isSection
            to={`/editor/${listId}`}
            headline={intl.formatMessage({
              id: "export.title",
            })}
          />
        )}

        <h2 className="export__subtitle">
          <FormattedMessage id="export.copyTitle" />
        </h2>
        <div className="checkbox export__visible-checkbox">
          <input
            type="checkbox"
            id="compact"
            onChange={() => setIsCompactList(!isCompactList)}
            checked={isCompactList}
            className="checkbox__input"
          />
          <label htmlFor="compact" className="checkbox__label">
            <FormattedMessage id="export.compactList" />
          </label>
        </div>
        <p className="export__description">
          <i>
            <FormattedMessage id="export.compactListDescription" />
          </i>
        </p>
        <div className="checkbox export__visible-checkbox">
          <input
            type="checkbox"
            id="show"
            onChange={() => setIsShowList(!isShowList)}
            checked={isShowList}
            className="checkbox__input"
          />
          <label htmlFor="show" className="checkbox__label">
            <FormattedMessage id="export.visibleList" />
          </label>
        </div>
        <p className="export__description">
          <i>
            <FormattedMessage id="export.visibleListDescription" />
          </i>
        </p>
        {/* <div className="checkbox export__visible-checkbox">
          <input
            type="checkbox"
            id="forum"
            onChange={() => setIsForumList(!isForumList)}
            checked={isForumList}
            className="checkbox__input"
          />
          <label htmlFor="forum" className="checkbox__label">
            <FormattedMessage id="export.forumText" />
          </label>
        </div>
        <p className="export__description">
          <i>
            <FormattedMessage id="export.forumTextDescription" />
          </i>
        </p> */}
        <div className="checkbox export__visible-checkbox">
          <input
            type="checkbox"
            id="specialRules"
            onChange={() => setShowSpecialRules(!showSpecialRules)}
            checked={showSpecialRules}
            className="checkbox__input"
          />
          <label htmlFor="specialRules" className="checkbox__label">
            <FormattedMessage id="export.specialRules" />
          </label>
        </div>
        <p className="export__description"></p>
        <Expandable headline={<FormattedMessage id="export.preview" />}>
          <textarea className="export__text" value={listText} readOnly />
        </Expandable>
        <Button icon="share" onClick={() => share({ asText: true })}>
          <FormattedMessage id="export.shareText" />
        </Button>
        <p>
          <i>
            <FormattedMessage id="export.shareDescription" />
          </i>
        </p>
        {shareError && (
          <p className="export__error">
            <FormattedMessage id="export.error" />
          </p>
        )}
        <Button
          icon={copied ? "check" : "copy"}
          onClick={copyText}
          spaceTop
          spaceBottom
        >
          {copied
            ? intl.formatMessage({
                id: "export.copied",
              })
            : intl.formatMessage({
                id: "export.copy",
              })}
        </Button>
        <br />
        {copyError && (
          <p className="export__error">
            <FormattedMessage id="export.error" />
          </p>
        )}
        <Button icon="download" href={textFileUrl} download={textFileName}>
          <FormattedMessage id="export.downloadAsText" />
        </Button>

        <h2 className="export__subtitle">
          <FormattedMessage id="export.owbTitle" />
        </h2>
        <p>
          <i>
            <FormattedMessage id="export.dowloadInfo" />
          </i>
        </p>
        <Button
          icon="download"
          href={fileUrl}
          download={fileName}
          spaceBottom
          spaceTop
        >
          <FormattedMessage id="export.download" />
        </Button>
        <br />
        <Button icon="share" onClick={share}>
          <FormattedMessage id="export.shareOwb" />
        </Button>
        <p className="export__description">
          <i>
            <FormattedMessage id="export.shareDescription" />
          </i>
        </p>
        {shareOwbError && (
          <p className="export__error">
            <FormattedMessage id="export.error" />
          </p>
        )}
      </MainComponent>
    </>
  );
};
