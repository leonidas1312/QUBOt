import copy
import pennylane as qml
from pennylane import numpy as np
import numpy as cnp
import gurobipy as gp
from gurobipy import GRB
import time
import torch


# Functions used in the quantum enchanced optimizer

def pennylane_HEcirc(angles):
    """
        Function to generate a hardware efficient ansatz

        :param nq: Number of qubits
        :param depth: The depth of the QC
        :param angles: The rotation angles for the QC, size = depth*nq

        :return: List of probabilities of the resulting quantum state

    """
    # Apply one layer of hadamards
    for nq_ in range(nqq):
        qml.Hadamard(wires=nq_)

    # Apply layers of single qubit rotations and entangling gates
    for l_ in range(n_layers):
        for i_ in range(nqq):
            qml.RY(angles[i_ + l_ * nqq], wires=i_)

        for j in range(0, nqq, 2):
            if j >= nqq - 1:
                continue
            else:
                qml.CNOT(wires=[j, j + 1])
        for k in range(1, nqq, 2):
            if k >= nqq - 1:
                continue
            else:
                qml.CNOT(wires=[k, k + 1])

    return qml.probs(wires=[i for i in range(nqq)])


def calmecf(angles):  # MIN ENCODING CASE

    """
    Function to calculate a value for the cost function

    :param angles: Rotation angles for the QC
    :return: A value for the cost function
    """
    start_time1 = time.time()
    # angles = angles[0]
    nc = len(QUBO_matrix)
    # start_time = time.time()
    data = my_qnode(angles)
    # print("Time to simulate the quantum circuit = "+str(time.time()-start_time))
    clist = data[::2] + data[1::2]
    blist = []
    for p in range(nc):
        if clist[p] == 0:
            # print("Random bit "+str(p))
            blist.append(0.5)
            # blist.append(0.5)
        else:
            blist.append(data[2 * p + 1] / clist[p])

    end_time1 = time.time()
    print("Time running the qc and getting back results : " + str(end_time1 - start_time1))
    start_time_opt = time.time()
    # blist is the list of probabilities for the i-th variable to take the value x_i = 1.
    blist = copy.deepcopy(np.array(blist))
    prob_matrix = np.outer(blist, blist)  # Probability matrix
    prob_diag = np.diag(prob_matrix)  # Diagonal of probability matrix
    mat_diag = np.diag(QUBO_matrix)  # Diagonal of problem matrix (A-mat)
    totcost = np.multiply(prob_matrix, QUBO_matrix).sum()  # Cost function but with squared probabilities on diagonals
    subtract_cost = np.multiply(prob_diag, mat_diag).sum()  # Subtract the contribution of squared probabilties
    add_cost = np.multiply(blist, mat_diag).sum()  # Adds back the correct contribution for diagonal elements
    quantum_cost = totcost - subtract_cost + add_cost + const  # Adds and removes the correct contributions accordingly
    end_time_opt = time.time()
    print("Time to estimate cost : " + str(end_time_opt - start_time_opt))
    # print(quantum_cost)
    return quantum_cost


def draw_bitstrings_minenc(angles, nbitstrings):
    """
    Function to sample nbitstrings unique bitstrings from the output of the QC

    :param angles: Rotation angles for the QC
    :param nbitstrings: Number of bitstrings to sample from the output of the QC
    :return: Sampled bitstrings
    """
    nc = len(QUBO_matrix)
    data = my_qnode(angles)
    clist = data[::2] + data[1::2]
    blist = []
    for p in range(nc):
        if clist[p] == 0:
            blist.append(0.5)
        else:
            blist.append(data[2 * p + 1] / clist[p])

    # blist is the list of probabilities for the i-th variable to take the value x_i = 1.
    list_of_bitstrings = set()
    rz1 = cnp.random.RandomState()

    # Samples the bitstrings
    while len(list_of_bitstrings) < nbitstrings:
        bitstring = tuple(rz1.choice(2, p=[1 - bitprob, bitprob]) for bitprob in blist)

        # Add the bitstring to the set if it's not a duplicate
        list_of_bitstrings.add(bitstring)

    return [np.array(bitstring) for bitstring in list_of_bitstrings]


def softmax(x, temperature=1.0):
    """
    Calculate softmax probabilities of x using a temperature for exploration
    :param x: np array input
    :param temperature: Temperature for exploration
    :return: Probabilities with length equal of that of the input
    """
    e_x = np.exp((x - np.max(x)) / temperature)
    return e_x / e_x.sum()


def calculate_percentile(input_values, q):
    """
    Calculate the percentile q of the input values
    :param input_values: Input list of values
    :param q: Parameter q defines the percentile
    :return: A single value
    """
    return np.percentile(input_values, q)


def rescaled_rank_rewards(current_value, previous_values, q=1):
    """
    Rescaled rank rewards obtained from : https://iopscience.iop.org/article/10.1088/2632-2153/abc328 eq. 8.
    :param current_value: Current value
    :param previous_values: Previous listed values
    :param q: Parameter q defines the percentile
    :return: rescaled rank reward
    """
    Cq = calculate_percentile(previous_values, q)
    #print(f"Percentile cost: {Cq}")
    if current_value < Cq:
        return -(q / 100)
    elif current_value > Cq:
        return 1 - q / 100
    else:
        return 1 if torch.rand(1).item() > 0.5 else -1


# Simulated Annealing Function
def simulated_annealing(current_cost, new_cost, temperature):
    if new_cost < current_cost:
        return True
    else:
        prob_accept = np.exp(-(new_cost - current_cost) / temperature)
        #return np.random.rand() < prob_accept
        return True


def simplified_rl_search(bitstring, QUBO_matrix, const, time_limit, temperature=10, verbose=False):
    """
    Reinforcement learning local search for enhancing the quality of solutions obtained from the Variational
    Quantum Optimization part of the main algorithm.
    Uses a hybrid of algorithms:
    1.Softmax & rescaled rank reward system for exploration. Flipping multiple bits at a single iteration
    2.UCB based search for exploitation. Flip a single most promising bit at a single iteration

    :param bitstring: Initial QUBO solution
    :param QUBO_matrix: QUBO matrix
    :param const: Constant of the QUBO problem
    :param time_limit: Time limit in seconds
    :param temperature: Temperature value for exploration in the softmax probabilities
    :param verbose: True if we want printing during optimizing
    :return: Best solution, Best cost, List of costs found during optimization
    """
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    # device = torch.device('cpu')
    torch.cuda.empty_cache()
    QUBO_matrix = torch.tensor(QUBO_matrix, dtype=torch.float32, device=device)
    const = torch.tensor(const, dtype=torch.float32, device=device)
    initial_bitstring = torch.tensor(bitstring, dtype=torch.float32, device=device)
    #print("initial bs : ", initial_bitstring)
    # initial_bitstring = torch.randint(0, 2, (len(bitstring),), dtype=torch.float32, device=device)
    best_state = initial_bitstring.clone()
    state = initial_bitstring.clone()
    num_bits = len(bitstring)
    bit_flip_rewards = np.zeros(num_bits)  # Track rewards for flipping each bit
    learning_rate = 0.1  # How quickly to update rewards
    best_cost = torch.matmul(state, torch.matmul(QUBO_matrix, state)) + const
    progress_costs = [best_cost.item()]
    #print("Initial cost : ", best_cost.item())
    # progress_costs_ucb = []
    cut_values = [best_cost.item()]  # List to store cut values of the last P episodes
    P = 100
    total_iterations = 0  # Keep track of the total number of iterations
    # UCB Initialization
    bit_flip_counts = np.zeros(num_bits)  # Counts of how many times each bit has been flipped
    bit_flip_total_rewards = np.zeros(num_bits)  # Total rewards for flipping each bit
    progress_rescaled_rewards = []
    start_time = time.time()
    is_softmax_phase = True
    while not time_limit or (time.time() - start_time) < time_limit:
        iteration_start_time = time.time()  # Starting timestamp for the current iteration
        remaining_time = time_limit - (time.time() - start_time)
        total_iterations += 1
        # current_cost = torch.matmul(state, torch.matmul(QUBO_matrix, state)) + const
        # Determine whether to use softmax or UCB based on the iteration number
        #if remaining_time > 1 * time_limit:
            # Softmax-based multiple bit flipping

        #    print("Rewards : ", bit_flip_rewards)
        #    flip_probabilities = softmax(bit_flip_rewards, temperature)
        #    print("Softmax probs : ", flip_probabilities)
        #    flip_probabilities_tensor = torch.tensor(flip_probabilities, dtype=torch.float32, device=device)
        #    new_state = torch.bernoulli(flip_probabilities_tensor).to(device)
            #print("New : ", new_state)
            # hamming_distance = torch.sum(torch.abs(new_state - state)).item()
        #else:
        is_softmax_phase = False
        # UCB based single bit flipping
        total_actions = np.sum(bit_flip_counts)
        if total_actions > 0:
            #print("UCB rewards : ", bit_flip_total_rewards)
            ucb_scores = bit_flip_total_rewards / (bit_flip_counts + 1e-5)
            ucb_scores += np.sqrt(2 * np.log(total_actions) / (bit_flip_counts + 1e-5))
            #print("UCB scores : ", ucb_scores)
            bit_to_flip = np.argmax(ucb_scores)
            #print("UCB Bit to flip : ", bit_to_flip)
        else:
            bit_to_flip = np.random.choice(num_bits)
        new_state = state.clone()
        new_state[bit_to_flip] = 1 - new_state[bit_to_flip]
            # print(bit_to_flip)

        new_cost = torch.matmul(new_state, torch.matmul(QUBO_matrix, new_state)) + const
        progress_costs.append(new_cost.item())
        #print("New state : ", new_state)
        #print("New cost : ", new_cost)
        # Update for UCB
        #if remaining_time <= 0.9 * time_limit:
        if simulated_annealing(best_cost.item(), new_cost.item(), temperature):

            if new_cost.item() < best_cost.item():
                best_state = new_state
                best_cost = new_cost

            state = new_state  # Update state for next iteration
            # Add new cost to cut_values and ensure it only contains the last P values
            cut_values.append(new_cost.item())
            cut_values = cut_values[-P:]

        bit_flip_total_rewards[bit_to_flip] += rescaled_rank_rewards(new_cost.item(), cut_values)
        bit_flip_counts[bit_to_flip] += 1
        #else:
        #    if new_cost.item() < best_cost.item():
        #        best_state = new_state
        #        best_cost = new_cost
        #        state = new_state  # Update state for next iteration

                # Add new cost to cut_values and ensure it only contains the last P values
        #        cut_values.append(new_cost.item())
        #        cut_values = cut_values[-P:]

            # Calculate rescaled ranked reward based on new state
        #    rescaled_reward = rescaled_rank_rewards(new_cost.item(), cut_values)

            # Update policy (learning) using the rescaled ranked reward
        #    bit_flip_rewards = bit_flip_rewards + learning_rate * (rescaled_reward - bit_flip_rewards)

        # progress_rescaled_rewards.append(rescaled_reward)
        # progress_costs.append(new_cost.item())
        # Decay the epsilon and temperature to reduce exploration over time
        # temperature *= 0.99
        iteration_time = time.time() - iteration_start_time

        if verbose:
            print(
                f"Current cost: {new_cost.item()}, Global cost: {best_cost.item()}, Time per iteration: {iteration_time:.4f} seconds, Time remaining: {remaining_time:.4f} seconds")

    return best_state.cpu().numpy(), best_cost.cpu().numpy(), progress_costs


def OPT_step(opt, theta):
    """
    One optimizer step of the main algorithm. This function returns the new variational angles and cost after an
    optimizer step.
    :param opt: Optimizer to use. Must implement step_and_cost from pennylane
    :param theta: Variational angles of the quantum circuit
    :return: New variational angles theta, new cost found
    """
    theta, adam_cost = opt.step_and_cost(calmecf, theta)

    return theta, adam_cost


def quantum_opt(QUBO_m, c, num_layers, max_iters, nbitstrings, opt_time, rl_time,
                initial_temperature, verbose=False):
    """Heuristic Quantum Enhanced Optimization Algorithm for QUBO problems.
    The quantum part is used to find good initial solutions for the RL search algorithm.
    The algorithm has two parts (sequential):
    1. Optimization of a variational quantum circuit using minimal encoding (https://arxiv.org/pdf/2007.01774).
    Using minimal encoding we can obtain good initial solutions from quantum simulations or quantum computers with
    a logarithmic reduction in the number of qubits with the number of classical variables i.e. 128cl vars -> 8 qubits,
    256cl vars -> 9 qubits, 4096cl vars -> 13 qubits and so on.
    2. Reinforcement learning local search for enhancing the quality of solution of the VQC. The implementation
    splits the rl_time into nbitstring parts of rl_time/nbitstrings time, so that we can choose to sample and enhance
    many solutions from the VQC.

    :param QUBO_m: QUBO matrix to be minimized
    :param c: Constant of the QUBO problem
    :param num_layers: Number of layers for the quantum circuit
    :param max_iters: Maximum number of [optimizer+RL search] iterations
    :param nbitstrings: Number of samples to draw from the quantum circuit when using minimal encoding
    :param opt_time: Optimizer time to run in seconds
    :param rl_time: RL algorithm time to run in seconds
    :param initial_temperature: Starting temperature for the RL search
    :param verbose: True for printing of RL search
    :return: Best bitstring found , Best cost function value, List of cost function values for every iteration of HQEOA,
    Time per [optimizer+RL search] iteration, List of cost function values from each iteration of the RL search.
    """
    global nqq, n_layers, QUBO_matrix, const, dev, my_qnode
    nqq = int(np.ceil(np.log2(len(QUBO_m)))) + 1
    n_layers = num_layers
    QUBO_matrix = QUBO_m
    const = c
    num_shots = 10000
    dev = qml.device("lightning.qubit", wires=nqq, shots=num_shots)
    my_qnode = qml.QNode(pennylane_HEcirc, dev, diff_method="parameter-shift")

    print("Number of classical variables = " + str(len(QUBO_m)))
    print("Number of qubits for the quantum circuit = " + str(nqq))
    print("Number of layers for the quantum circuit = " + str(num_layers))
    print("Number of shots = " + str(num_shots))

    opt = qml.AdamOptimizer(stepsize=0.01)
    theta = np.array([2 * np.pi * np.random.rand() for _ in range(nqq * n_layers)], requires_grad=True)

    best_theta = []
    best_cost = float('inf')
    best_cost_opt = float('inf')
    best_bitstring = None

    cost_values = []
    iter_counter_opt = 0

    progress_opt_costs = []

    for iteration in range(max_iters):
        start_time_loop = time.time()
        # 1. Run ADAM for a given time
        end_time = time.time() + opt_time

        while time.time() < end_time:
            start_time_opt = time.time()
            # Execute one step of ADAM
            theta, opt_cost = OPT_step(opt, theta)
            end_time_opt = time.time()
            iter_counter_opt += 1
            time_per_adam = end_time_opt - start_time_opt
            print("Optimizer iteration : " + str(iter_counter_opt) + ", Cost = " + str(opt_cost) + ", Time : " + str(
                time_per_adam) + " seconds")

            if opt_cost < best_cost_opt:
                best_cost_opt = opt_cost
                best_theta = theta

            progress_opt_costs.append(best_cost_opt)

        # 3. Run branching for a given time
        iter_counter_branch = 0
        # while time.time() < end_time:
        # 2. Sample bitstrings from the qc
        drawn_bitstrings = draw_bitstrings_minenc(best_theta, nbitstrings)
        # randomly sample a bitstring
        # drawn_bitstrings = [np.random.choice([0, 1], size=len(QUBO_matrix))]

        start_time_branching = time.time()
        for draw_bs in drawn_bitstrings:
            best_bs_bb, current_cost, progress_rl_costs = simplified_rl_search(draw_bs,
                                                                               QUBO_matrix,
                                                                               const,
                                                                               rl_time / len(
                                                                                   drawn_bitstrings),
                                                                               temperature=initial_temperature,
                                                                               verbose=verbose)

            if current_cost < best_cost:
                best_cost = current_cost
                best_bitstring = best_bs_bb

            end_time_branching = time.time()
            time_per_branching = end_time_branching - start_time_branching
            iter_counter_branch += 1
            print(
                "RL iteration : " + str(iter_counter_branch) + ", Cost = " + str(current_cost) + ", Time : " + str(
                    time_per_branching) + " seconds")

        cost_values.append(best_cost)

        end_time_loop = time.time()
        time_per_iteration = end_time_loop - start_time_loop
        print("Cycle no. " + str(iteration + 1))
        print("Time per ADAM/RL cycle = " + str(time_per_iteration))
        print("Overall minimum cost found = " + str(best_cost))

    return best_bitstring, \
        best_cost, \
        cost_values, \
        time_per_branching + time_per_adam, \
        progress_rl_costs, \
        progress_opt_costs


def vqb_to_gurobi(qubo_array, qubo_constant, num_layers, num_cycles, opt_time, olr_time,
                  gurobi_vqb_time, initial_temperature, verbose):
    start_time = time.time()
    best_sol_quantum, best_cost, cost_values_quantum, time_per_iteration, progress_costs, _ = quantum_opt(
        qubo_array,
        qubo_constant,
        num_layers=num_layers,
        max_iters=num_cycles,
        nbitstrings=10,
        opt_time=opt_time,
        rl_time=olr_time,
        initial_temperature=initial_temperature,
        verbose=verbose)
    end_time = time.time()
    print("Total time of VQB = " + str(end_time - start_time) + " seconds")
    best_sol, best_cf, sampled_costs, sampled_times = gurobi_opt(qubo_array, qubo_constant, gurobi_vqb_time,
                                                                 initial_solution=best_sol_quantum)

    return best_sol, best_cf, cost_values_quantum, sampled_costs, sampled_times, progress_costs, time_per_iteration


def gurobi_only(qubo_array, qubo_constant, gurobi_only_total_time):
    """
    Run gurobi for a specified time or until it finds the optimal solution of a QUBO instance
    :param qubo_array: QUBO array
    :param qubo_constant: QUBO constant
    :param gurobi_only_total_time: Total time to run in seconds
    :return: Best solution, Best cost function, Sampled costs, Sampled times
    """
    best_sol, best_cf, s_costs, s_times = gurobi_opt(qubo_array, qubo_constant, gurobi_only_total_time)

    return best_sol, best_cf, s_costs, s_times


def gurobi_callback(model, where):
    sample_step = 1
    if where == GRB.Callback.MIP:
        time_now = time.time() - model._start_time  # Access start_time from the model
        if time_now // sample_step > model._last_recorded_time // sample_step:  # Check if 1 second have passed
            model._last_recorded_time = time_now
            best_obj = model.cbGet(GRB.Callback.MIP_OBJBST)
            model._recorded_obj.append((time_now, best_obj))
    elif where == GRB.Callback.SIMPLEX:
        time_now = time.time() - model._start_time  # Access start_time from the model
        if time_now // sample_step > model._last_recorded_time // sample_step:  # Check if 1 second have passed
            model._last_recorded_time = time_now
            best_obj = model.cbGet(GRB.Callback.SPX_OBJVAL)
            model._recorded_obj.append((time_now, best_obj))


def gurobi_opt(QUBO_m, c, time_limit, method='minimize', initial_solution=None):
    """


    :param QUBO_m: QUBO matrix to be optimized
    :param c: constant for the optimization problem
    :param time_limit: time limit for gurobi in seconds
    :param method: Solve by minimization or maximization, default is 'minimize', for maximization input 'maximize'
    :param initial_solution: initial solution to start the optimizer with
    :return: best bitstring, best cost function value
    """

    # set up the problem
    model = gp.Model()
    model._start_time = time.time()  # Set start_time as an attribute of the model
    model.setParam('TimeLimit', time_limit)
    model.setParam('NodefileStart', 0.5)
    x = model.addVars(QUBO_m.shape[0], vtype=GRB.BINARY, name="x")
    obj = gp.QuadExpr()
    for i in range(QUBO_m.shape[0]):
        for j in range(QUBO_m.shape[1]):
            obj += QUBO_m[i, j] * x[i] * x[j]
    obj += c

    if method == 'maximize':
        # Set the objective as a maximization problem
        model.setObjective(obj, GRB.MAXIMIZE)
    else:
        model.setObjective(obj)

    # print("AAAA"+str(model._start_time))
    # set initial solution from QUBO optimizer if any
    if initial_solution is not None:
        # best_heuristic_sol = initial_solution
        for i, val in enumerate(initial_solution):
            x[i].start = val

    model._last_recorded_time = 0
    model._recorded_obj = []

    # optimize
    model.optimize(gurobi_callback)
    best_sol = []

    for v in model.getVars():
        best_sol.append(int(v.x))

    sampled_objs = [obj for _, obj in model._recorded_obj]
    sampled_times = [t for t, _ in model._recorded_obj]

    return best_sol, model.objVal, sampled_objs, sampled_times
