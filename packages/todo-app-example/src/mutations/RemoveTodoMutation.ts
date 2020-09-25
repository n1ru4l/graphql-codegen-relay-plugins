import {
  useRemoveTodoMutationMutation,
  RemoveTodoMutationMutation,
  Todo_UserFragment,
  Todo_TodoFragment,
  RemoveTodoInput,
  TodoList_UserFragmentDoc,
  TodoList_UserFragment,
} from "../generated-types";
import * as Option from "../Option";
import { useCallback } from "react";
import { MutationUpdaterFn } from "apollo-client";

const createOptimisticResponse = (
  todo: Todo_TodoFragment,
  user: Todo_UserFragment
): RemoveTodoMutationMutation => ({
  __typename: "Mutation",
  removeTodo: {
    __typename: "RemoveTodoPayload",
    deletedTodoId: todo.id,
    user: {
      __typename: "User",
      id: user.id,
      completedCount: user.completedCount - (todo.complete ? 1 : 0),
      totalCount: user.totalCount - 1,
    },
  },
});

const update: MutationUpdaterFn<RemoveTodoMutationMutation> = (
  dataProxy,
  result
) => {
  const removedItemId = result?.data?.removeTodo?.deletedTodoId;
  const userId = result?.data?.removeTodo?.user.id;
  if (Option.isNone(removedItemId) || Option.isNone(userId)) {
    return;
  }
  const data = dataProxy.readFragment<TodoList_UserFragment>({
    fragment: TodoList_UserFragmentDoc,
    fragmentName: "TodoList_user",
    id: `User:${userId}`,
  });
  if (
    Option.isNone(data) ||
    Option.isNone(data.todos) ||
    Option.isNone(data.todos.edges)
  ) {
    return;
  }

  const newData = {
    ...data,
    todos: {
      ...data.todos,
      edges: data.todos.edges
        .filter(Option.isSome)
        .filter((edge) => (edge.node ? edge.node.id !== removedItemId : true)),
    },
  };

  dataProxy.writeFragment<TodoList_UserFragment>({
    fragment: TodoList_UserFragmentDoc,
    fragmentName: "TodoList_user",
    id: `User:${userId}`,
    data: newData,
  });
};

export const useRemoveTodoMutation = () => {
  const [mutate] = useRemoveTodoMutationMutation();

  return useCallback(
    (todo: Todo_TodoFragment, user: Todo_UserFragment) => {
      const input: RemoveTodoInput = {
        id: todo.id,
        userId: user.userId,
      };

      return mutate({
        variables: { input },
        optimisticResponse: createOptimisticResponse(todo, user),
        update,
      });
    },
    [mutate]
  );
};
