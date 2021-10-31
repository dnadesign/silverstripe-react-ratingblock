/* eslint-disable no-unreachable */
/* eslint-disable no-undef */
/* eslint-disable one-var */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-string-refs */
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Rating } from '@material-ui/lab';
import classNames from 'classnames';
import Loading from '../loading/loading';
import Star from '../star/star';
import Tag from '../tag/tag';

import './sass/rating.scss';

const RateComponent = forwardRef((props, ref) => {
    const {
            expandCommentOnRate,
            setCommentsValue,
            setRatingValue,
            setTagsValue,
            onSubmit,
            stars,
            enabled,
            name,
            errors,
            loading,
            form,
            page
        } = props,
        // check if this page has been previously rated by looking
        // for thje cookie with the pageName
        rating = props.value || 0,
        previouslyRated = props.previouslyRated || false,
        [value, setValue] = useState(rating),
        [hover, setHover] = useState(-1),
        [tags, setTags] = useState([]),
        [comments, setComments] = useState(form.comments.value),
        [expanded, setExpanded] = useState(form.comments.expanded),
        disabled = previouslyRated || loading || form.submitted,
        isFirstRender = useRef(true),
        starsRef = useRef(),
        commentInputRef = useRef(),
        commentButtonRef = useRef(),
        tagsRef = useRef(),
        ratingSubmitRef = useRef(),
        classes = classNames({
            'rating': true,
            'rating--disabled': disabled,
            'rating--expanded': expanded,
            'rating__rated': value > 0 && !previouslyRated
        }),
        /**
         * Expand out the comments area
         */
        setExpand = (e, prevent) => {
            prevent && e.preventDefault();
            setExpanded(!expanded);
        },
        /**
         * Render title
         */
        renderTitle = () => {
            return <h3
                className='rating__title'
            >
                {form.title || 'Rate this page'}
            </h3>;
        },
        /**
         * Render comments area
         * - only if enabled in bootData
         */
        renderComments = (disabled, submitted) => {
            const commentsClasses = classNames({
                'rating__comments': true,
                'rating__comments--expanded': expanded
            }), { errors, stars } = props;

            return form.comments.enabled ? (
                <div className='rating__comments-outer'>
                    {(stars && (!stars.Tags || stars.Tags.length === 0)) && (
                        <label
                            ref={commentButtonRef}
                            className='rating__comments-toggle'
                            onClick={() => setExpanded(!expanded)}
                            aria-controls='ratingcomments'
                            aria-expanded={expanded}
                            id='rating_commnets_expand'
                            disabled={disabled || submitted}
                        > Add a comment </label>
                    )}
                    <div
                        className={commentsClasses}
                        id='ratingcomments'
                        aria-hidden={!expanded}
                        aria-expanded={expanded}
                    >
                        <div className='rating__comments-field'>
                            <label
                                className='sr-only'
                                htmlFor={
                                    props.CommentsID
                                }
                            >
                                Additional comments
                            </label>
                            <textarea
                                ref={commentInputRef}
                                rows={5}
                                readOnly={submitted}
                                disabled={disabled || submitted || !expanded}
                                value={comments}
                                placeholder={form.comments.placeholder}
                                onChange={(event) => {
                                    setCommentsValue(event.target.value);
                                    setComments(event.target.value);
                                }}
                                name={form.comments.name}
                                aria-hidden={!expanded}
                            />
                            {errors['comments'] && (
                                <p className='rating__error'>{errors['comments']}</p>
                            )}
                        </div>
                    </div>
                </div>
            ) : null;
        },
        /**
         * Render stars
         */
        renderStars = (disabled) => {
            const descriptionClasses = classNames({
                'rating__description': true,
                'rating__description--disabled': value === 0
            });

            return ((stars && stars.Max > 0) &&
                <div className='rating__stars'>
                    <Rating
                        ref={starsRef}
                        name={`rating-${name}`}
                        emptyIcon={<Star stroke='#fff' />}
                        icon={<Star stroke='#fff' fill='#fff' />}
                        value={parseInt(value, 10)}
                        max={stars.Max}
                        onChange={(event, newValue) => {
                            setRatingValue(newValue);
                            setValue(newValue || 0);
                            setTags('');
                            renderTags();
                        }}
                        onChangeActive={(event, newHover) => {
                            setHover(newHover);
                        }}
                        disabled={disabled}
                    />
                    {value !== null && (stars.Labels && Object.keys(stars.Labels).length > 0) && <p className={descriptionClasses}>{stars.Labels[hover !== -1 ? hover : value]}</p>}
                    {errors['rating'] && (
                        <p className='rating__error'>Please select a rating</p>
                    )}
                </div>
            );
        },
        handleTagChange = (e, tag) => {
            if (e.currentTarget.checked) {
                setTags([...tags, tag]);
                !expanded && setExpanded(true);
            } else {
                const copy = [...tags];
                const index = copy.indexOf(tag);
                if (index > -1) {
                    copy.splice(index, 1);
                    setTags(copy);
                    tags.length === 0 && setExpanded(false);
                    // setTagsValue([...tags].join(','));
                }
            }
        },
        renderTags = (disabled) => {
            const tagList = form.tags && form.tags.split(',');

            return (value > 0 && stars && stars.Tags && stars.Tags.length > 0) && (
                <div
                    className='rating__tags'
                    ref={tagsRef}
                >
                    {
                        Object.values(stars.Tags[value - 1]).map((tag) => {
                            const checked = tagList.includes(tag);
                            return <Tag
                                key={`tag_${tag}`}
                                label={tag}
                                active={checked}
                                disabled={disabled}
                                onChange={e => handleTagChange(e, tag)}
                            />;
                        })
                    }
                    <input type='hidden' name='input_tags' id='input_tags' value={tags} />
                </div>
            );
        },
        /**
         * Render Submit button
         */
        renderSubmit = (disabled) => {
            return (value > 0 && (!stars.Tags || tags.length > 0) && <>
                <input
                    type='hidden'
                    name='pageName'
                    value={page.name}
                />
                <input
                    type='hidden'
                    name='pageID'
                    value={page.id}
                />
                <button
                    ref={ratingSubmitRef}
                    id='rating_submit'
                    type='submit'
                    className='button button--primary button--small button--cta button--rating rating__action'
                    aria-disabled={disabled}
                    disabled={disabled}
                    onClick={(e) => {
                        onSubmit(e);
                    }}
                >
                    Submit
                </button>
            </>);
        },
        renderIntro = (loading, submitted) => {
            return (
                loading ? (
                    <div className='rating__loading'>
                        <Loading id='rating-loading' showImmediately />
                    </div>
                ) : submitted ? (
                    // has just been submitted - show success message
                    <>
                        {form.successMessage ? (
                            <div
                                className='rating__result'
                                dangerouslySetInnerHTML={{
                                    __html: form.successMessage
                                }}
                            />
                        ) : (
                                <div className='rating__result'>
                                    <p>Thank you for your submission</p>
                                </div>
                            )}
                    </>
                ) : previouslyRated ? (
                    // rated in a previous session - dont show any message
                    <div />
                ) : form.intro ? (
                    // intro
                    <div
                        className='rating__into'
                        dangerouslySetInnerHTML={{
                            __html: form.intro
                        }}
                    />
                ) : <div />
            );
        };

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false; // toggle flag after first render/mounting
            // Page name allows us to store a reference to the page without relying on a page relation
            page['name'] = page.name || 'unknown';

            return;
        }

        expandCommentOnRate && (value > 0 ? setExpanded(true) : setExpanded(false));
    }, [value]);

    useEffect(() => {
        setTagsValue([...tags].join(','));
    }, [tags]);

    useImperativeHandle(ref, () => ({
        focusCheckedStar: () => {
            starsRef.current.querySelector('input:checked').focus();
        },
        get stars() {
            return starsRef.current;
        },
        get commentInput() {
            return commentInputRef.current;
        },
        get commentButton() {
            return commentButtonRef.current;
        },
        get tags() {
            return tagsRef.current;
        },
        get ratingSubmit() {
            return ratingSubmitRef.current;
        }
    }));

    /**
     * States:
     * Ratings disabled (via CMS / bootdata) - render empty div
     * Previously Submitted (from cookie) - show title and stars only. Dont show comments
     *      as that could be a security concern
     * Loading - show disabled form with a spinner
     * Submitted - user has just submitted a rating - show success and disabled form
     * Error - Error from the graphql backend. Only show errors message.
     */

    if (!enabled) {
        return <div data-rating-disabled />;
    }

    return (
        <div ref={ref} className={classes} data-rating-enabled data-rating-name={name}>

            {errors && errors.response ? (
                // errors returned from graphql. dont render anything else
                <div className='rating__message'>
                    <p>An errors occurred<br />Please try again later</p>
                </div>
            ) : (
                    <form
                        className='rating__form'
                    >
                        {renderTitle()}
                        {renderIntro(loading, form.submitted)}
                        {renderStars(disabled)}
                        {renderTags(disabled)}

                        {!previouslyRated && (
                            <>
                                {renderComments(disabled, form.submitted)}
                                {renderSubmit(disabled)}
                            </>
                        )}
                    </form>
                )}
        </div>
    );
});

export default RateComponent;
