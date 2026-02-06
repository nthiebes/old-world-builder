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
  const [hideItems, setHideItems] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [shareError, setShareError] = useState(false);
  const [shareOwbError, setOwbShareError] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSpecialRules, setShowSpecialRules] = useState(false);
  const [showPageNumbers, setShowPageNumbers] = useState(false);
  const [showCustomNotes, setShowCustomNotes] = useState(false);
  const [listType, setListType] = useState("regular");
  const [listFormatting, setListFormatting] = useState("text");
  const list = useSelector((state) =>
    state.lists.find(({ id }) => listId === id)
  );
  const listText = list
    ? getListAsText({
        list,
        isCompactList: listType === "compact",
        isMarkdownList: listFormatting === "markdown",
        isShowList: hideItems,
        showSpecialRules,
        showPageNumbers,
        showCustomNotes,
        intl,
        language,
        showStats: showStats,
        isSimpleList: listType === "simple",
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

  const isSimpleList = listType === "simple";

  return (
    <>
      <Helmet>
        <title>{`Warhammer Fantasy Builder | ${list?.name}`}</title>
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

        <h3 className="export__sub-subtitle">
          <FormattedMessage id="export.listTypeTitle" />
        </h3>
        <div className="radio export__visible-checkbox">
          <input
            type="radio"
            id="regular"
            onChange={() => setListType("regular")}
            checked={listType === "regular"}
            name="list"
            value="regular"
            className="radio__input"
          />
          <label htmlFor="regular" className="checkbox__label">
            <FormattedMessage id="export.regularList" />
          </label>
        </div>
        <div className="radio export__visible-checkbox">
          <input
            type="radio"
            id="compact"
            onChange={() => setListType("compact")}
            checked={listType === "compact"}
            name="list"
            value="compact"
            className="radio__input"
          />
          <label htmlFor="compact" className="checkbox__label">
            <FormattedMessage id="export.compactList" />
          </label>
        </div>
        <p className="export__radio-description">
          <i>
            <FormattedMessage id="export.compactListDescription" />
          </i>
        </p>
        <div className="radio export__visible-checkbox">
          <input
            type="radio"
            id="simple"
            onChange={() => setListType("simple")}
            checked={listType === "simple"}
            name="list"
            value="simple"
            className="radio__input"
          />
          <label htmlFor="simple" className="checkbox__label">
            <FormattedMessage id="export.minimalistList" />
          </label>
        </div>
        <p className="export__radio-description">
          <i>
            <FormattedMessage id="export.minimalistDescription" />
          </i>
        </p>

        <h3 className="export__sub-subtitle">
          <FormattedMessage id="export.formattingTitle" />
        </h3>
        <div className="radio export__visible-checkbox">
          <input
            type="radio"
            id="text"
            onChange={() => setListFormatting("text")}
            checked={listFormatting === "text"}
            name="formatting"
            value="text"
            className="radio__input"
          />
          <label htmlFor="text" className="checkbox__label">
            <FormattedMessage id="export.isTextList" />
          </label>
        </div>
        <div className="radio export__visible-checkbox">
          <input
            type="radio"
            id="markdown"
            onChange={() => setListFormatting("markdown")}
            checked={listFormatting === "markdown"}
            name="formatting"
            value="markdown"
            className="radio__input"
          />
          <label htmlFor="markdown" className="checkbox__label">
            <FormattedMessage id="export.isMarkdownList" />
          </label>
        </div>

        <h3 className="export__sub-subtitle">
          <FormattedMessage id="export.optionsTitle" />
        </h3>
        <div className="checkbox export__visible-checkbox">
          <input
            type="checkbox"
            id="specialRules"
            onChange={() => setShowSpecialRules(!showSpecialRules)}
            checked={showSpecialRules}
            className="checkbox__input"
            disabled={isSimpleList}
          />
          <label htmlFor="specialRules" className="checkbox__label">
            <FormattedMessage id="export.specialRules" />
          </label>
        </div>
        <div className="checkbox export__visible-checkbox">
          <input
            type="checkbox"
            id="showStats"
            onChange={() => setShowStats(!showStats)}
            checked={showStats}
            className="checkbox__input"
            disabled={isSimpleList}
          />
          <label htmlFor="showStats" className="checkbox__label">
            <FormattedMessage id="export.showStats" />
          </label>
        </div>
        <div className="checkbox export__visible-checkbox">
          <input
            type="checkbox"
            id="showPageNumbers"
            onChange={() => setShowPageNumbers(!showPageNumbers)}
            checked={showPageNumbers}
            className="checkbox__input"
            disabled={isSimpleList}
          />
          <label htmlFor="showPageNumbers" className="checkbox__label">
            <FormattedMessage id="export.showPageNumbers" />
          </label>
        </div>
        <div className="checkbox export__visible-checkbox">
          <input
            type="checkbox"
            id="showCustomNotes"
            onChange={() => setShowCustomNotes(!showCustomNotes)}
            checked={showCustomNotes}
            className="checkbox__input"
            disabled={isSimpleList}
          />
          <label htmlFor="showCustomNotes" className="checkbox__label">
            <FormattedMessage id="export.showCustomNotes" />
          </label>
        </div>
        <div className="checkbox export__visible-checkbox">
          <input
            type="checkbox"
            id="show"
            onChange={() => setHideItems(!hideItems)}
            checked={hideItems}
            className="checkbox__input"
          />
          <label htmlFor="show" className="checkbox__label">
            <FormattedMessage id="export.visibleList" />
          </label>
        </div>
        <p className="export__radio-description">
          <i>
            <FormattedMessage id="export.visibleListDescription" />
          </i>
        </p>
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

        <hr />

        <h2 className="export__subtitle">
          <FormattedMessage id="export.owbTitle" />
        </h2>
        <p>
          <FormattedMessage id="export.dowloadInfo" />
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
