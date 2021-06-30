import { Action, createSelector, Selector, State, StateContext } from "@ngxs/store";
import { Injectable } from "@angular/core";
import { StateStatus } from "../../request/common/models/state-status";
import { append, iif, insertItem, patch, updateItem } from "@ngxs/store/operators";
import { flatMap, map, take, tap } from "rxjs/operators";
import { ContextsService } from "../services/contexts.service";
import { ChatSubItem } from "../models/chat-item";
import { RequestPositionList } from "../../request/common/models/request-position-list";
import { ChatSubItems } from "../actions/chat-sub-items.actions";
import { ChatMessages } from "../actions/chat-messages.actions";
import { decrement } from "../../shared/state-operators/decrement";
import { increment } from "../../shared/state-operators/increment";
import { RequestGroup } from "../../request/common/models/request-group";
import { sort } from "../../shared/state-operators/sort";
import Fetch = ChatSubItems.Fetch;
import FetchPositions = ChatSubItems.FetchPositions;
import AppendConversation = ChatSubItems.AppendConversation;
import IncrementUnread = ChatSubItems.IncrementUnread;
import MarkAsRead = ChatMessages.MarkAsRead;
import MoveToTop = ChatSubItems.MoveToTop;

export interface MessagesStateModel {
  subItems: ChatSubItem[];
  status: StateStatus;
}

type Model = MessagesStateModel;
type Ctx = StateContext<Model>;

@State<Model>({
  name: 'ChatSubItems',
  defaults: { subItems: [], status: "pristine" }
})
@Injectable()
export class ChatSubItemsState {
  constructor(private service: ContextsService) {}

  @Selector() static status({ status }: Model) { return status; }

  static subItems = (withGroupItems: boolean = false) => createSelector([ChatSubItemsState],
    ({ subItems }: Model) => subItems.filter(({ position }) => !!position && (withGroupItems || !position["group"]))
  )

  static subItem = (id: RequestPositionList["id"]) => createSelector([ChatSubItemsState],
    ({ subItems }: Model) => subItems.find(({ position }) => position && position.id === id)
  )

  static subItemsByGroup = (groupId: RequestGroup["id"]) => createSelector([ChatSubItemsState],
    ({ subItems }: Model) => {
      const group = subItems.find(item => item.position?.id === groupId).position as RequestGroup;
      const ids = group?.positions.map(({ id }) => id);

      return subItems.filter((item) => item?.position && ids.includes(item.position.id));
    })

  static position = (id: RequestPositionList["id"]) => createSelector([ChatSubItemsState.subItem(id)],
    (subItem: ChatSubItem) => subItem?.position
  )

  static conversationId = (id: RequestPositionList["id"]) => createSelector(
    [ChatSubItemsState.subItem(id)], (subItem: ChatSubItem) => subItem.position.conversation.externalId
  )

  @Action(Fetch, { cancelUncompleted: true })
  fetchSubItems({ setState, dispatch }: Ctx, { role, request }: Fetch) {
    setState(patch({ subItems: [], status: "fetching" } as Model));
    // Получаем конверсейшены только по текущему контексту
    if (request.context?.externalId) {
      return this.service.get({ contextId: request.context?.externalId }).pipe(
        take(1),
        map(([{ conversations }]) => conversations.map(conversation => ({ conversation }))),
        tap((subItems: ChatSubItem[]) => setState(patch({ subItems }))),
        flatMap(() => dispatch(new FetchPositions(role, request)))
      );
    } else {
      dispatch(new FetchPositions(role, request));
    }
  }

  @Action(FetchPositions, { cancelUncompleted: true })
  fetchPositions({ setState }: Ctx, { request, role }: FetchPositions) {
    return this.service.getRequestItems(request.id, role).pipe(tap(positions => {
      (positions).forEach(function appendOrUpdatePositions(position) {
        setState(patch({
          subItems: iif(
            subItems => !!position.conversation || subItems.some(item => item.position?.id === position.id),
            updateItem(
              item => (position.conversation && item.conversation?.id === position.conversation.externalId) || item.position?.id === position.id,
              patch({ position })
            ),
            append([{ position } as ChatSubItem])
          ),
        }));

        if (position instanceof RequestGroup) {
          position.positions.forEach(appendOrUpdatePositions);
        }
      });
    }), tap(() => setState(patch<Model>({ status: "received" }))));
  }

  @Action(AppendConversation)
  appendConversation({setState}: Ctx, {conversation}: AppendConversation) {
    const findFn = (item: ChatSubItem) => item.position?.conversation?.externalId === conversation.id;
    return setState(patch({
      subItems: iif(
        subItems => subItems.some(findFn),
        updateItem(findFn, patch({ conversation })),
        insertItem({ conversation })
      )
    }));
  }

  @Action(IncrementUnread)
  incrementUnread({ setState, getState }: Ctx, { conversation }: IncrementUnread) {
    const findFn = (item: ChatSubItem) => item.conversation?.id === conversation.id;
    const itemIncremented = getState().subItems.find(findFn);
    itemIncremented.conversation.unreadCount += 1;

    setState(patch({
      subItems: updateItem(findFn, itemIncremented)
    }));
  }

  @Action(MoveToTop)
  moveToTop({ setState }: Ctx, { id }: MoveToTop) {
    const findFn = (item: ChatSubItem) => item.conversation?.id === id;

    setState(patch({ subItems: sort(findFn) }));
  }

  @Action(MarkAsRead)
  markAsRead({ setState, getState }: Ctx, { conversationId, updated }: MarkAsRead) {
    const findFn = ({conversation}: ChatSubItem) => conversation?.id === conversationId;
    const itemDecremented = getState().subItems.find(findFn);
    itemDecremented.conversation.unreadCount -= updated;

    return setState(patch({
      subItems: updateItem(findFn, itemDecremented)
    }));
  }
}
