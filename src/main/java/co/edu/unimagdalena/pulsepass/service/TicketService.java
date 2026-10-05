package co.edu.unimagdalena.pulsepass.service;

import java.util.List;

import co.edu.unimagdalena.pulsepass.dto.request.PurchaseTicketRequest;
import co.edu.unimagdalena.pulsepass.dto.response.TicketResponse;

public interface TicketService {
    TicketResponse purchase(PurchaseTicketRequest request);
    TicketResponse findByCode(String ticketCode);
    List<TicketResponse> findByUserEmail(String email);
    List<TicketResponse> findPaidTicketsByEvent(String eventCode);
    TicketResponse cancel(String ticketCode);
    TicketResponse markAsUsed(String ticketCode);
}